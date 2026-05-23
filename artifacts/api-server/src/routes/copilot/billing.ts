import { Router, type IRouter } from "express";
import { db, teachersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireActiveTeacher } from "../../middlewares/auth.js";
import { getUsage } from "../../middlewares/quota.js";
import { getUncachableStripeClient } from "../../lib/stripeClient.js";
import { syncTeacherFromCustomer } from "../../lib/stripeSync.js";

const router: IRouter = Router();
router.use(requireAuth, requireActiveTeacher);

function publicBaseUrl(): string {
  const domain = process.env["REPLIT_DOMAINS"]?.split(",")[0];
  return domain ? `https://${domain}` : "http://localhost:5000";
}

async function findActivePriceId(): Promise<string | null> {
  const result = (await db.execute(sql`
    SELECT pr.id
    FROM stripe.prices pr
    JOIN stripe.products p ON p.id = pr.product
    WHERE pr.active = true
      AND p.active = true
      AND pr.recurring IS NOT NULL
      AND (p.metadata ->> 'paideia_plan') = 'unlimited'
    ORDER BY pr.created DESC
    LIMIT 1
  `)) as unknown as { rows: Array<{ id: string }> };
  return result.rows[0]?.id ?? null;
}

async function ensureCustomer(teacherId: string, email: string, name: string): Promise<string> {
  // Transaction with row-level lock so two concurrent /checkout calls can
  // never create duplicate Stripe customers for the same teacher.
  return db.transaction(async (tx) => {
    const rows = await tx.execute(sql`
      SELECT stripe_customer_id FROM copilot_teachers
      WHERE id = ${teacherId} FOR UPDATE
    `) as unknown as { rows: Array<{ stripe_customer_id: string | null }> };
    const existing = rows.rows[0]?.stripe_customer_id;
    if (existing) return existing;
    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { teacherId },
    });
    await tx
      .update(teachersTable)
      .set({ stripeCustomerId: customer.id })
      .where(eq(teachersTable.id, teacherId));
    return customer.id;
  });
}

router.get("/usage", async (req, res) => {
  const t = req.teacher!;
  // Refresh teacher's stripe state opportunistically so the badge updates
  // immediately after a checkout return, even before the webhook fires.
  if (t.stripeCustomerId) {
    await syncTeacherFromCustomer(t.stripeCustomerId);
    const fresh = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.id, t.id))
      .limit(1);
    const updated = fresh[0] ?? t;
    res.json(await getUsage(updated.id, updated.subscriptionStatus, updated.subscriptionCurrentPeriodEnd, updated.email));
    return;
  }
  res.json(await getUsage(t.id, t.subscriptionStatus, t.subscriptionCurrentPeriodEnd, t.email));
});

router.post("/checkout", async (req, res) => {
  const t = req.teacher!;
  try {
    const priceId = await findActivePriceId();
    if (!priceId) {
      res.status(503).json({
        error: "No subscription product configured yet. Ask the founder to run the seed-products script.",
        code: "no_price",
      });
      return;
    }
    const customerId = await ensureCustomer(t.id, t.email, t.name);
    const stripe = await getUncachableStripeClient();
    const base = publicBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/app/upgrade?checkout=success`,
      cancel_url: `${base}/app/upgrade?checkout=cancelled`,
      allow_promotion_codes: true,
    });
    res.json({ url: session.url });
  } catch (err) {
    req.log?.error({ err }, "checkout failed");
    res.status(500).json({ error: "Could not start checkout" });
  }
});

router.post("/portal", async (req, res) => {
  const t = req.teacher!;
  if (!t.stripeCustomerId) {
    res.status(400).json({ error: "No billing account yet. Upgrade first." });
    return;
  }
  try {
    const stripe = await getUncachableStripeClient();
    const base = publicBaseUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: t.stripeCustomerId,
      return_url: `${base}/app/upgrade`,
    });
    res.json({ url: session.url });
  } catch (err) {
    req.log?.error({ err }, "portal failed");
    res.status(500).json({ error: "Could not open billing portal" });
  }
});

router.post("/admin-set-status", async (req, res) => {
  const t = req.teacher!;
  const isAdmin = (process.env["ADMIN_EMAILS"] ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(t.email.toLowerCase());
  if (!isAdmin) { res.status(403).json({ error: "Founder only" }); return; }
  const { teacherId, status } = req.body as { teacherId?: string; status?: string };
  if (!teacherId || !status || !["free", "active", "canceled"].includes(status)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const periodEnd = status === "active" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
  await db
    .update(teachersTable)
    .set({ subscriptionStatus: status, subscriptionCurrentPeriodEnd: periodEnd })
    .where(eq(teachersTable.id, teacherId));
  res.json({ ok: true });
});

export default router;
