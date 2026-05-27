import { Router, type IRouter } from "express";
import { db, studyUsersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireStudyUser } from "../../middlewares/auth.js";
import { getUncachableStripeClient } from "../../lib/stripeClient.js";

const router: IRouter = Router();
router.use(requireStudyUser);

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
    ORDER BY pr.created DESC
    LIMIT 1
  `)) as unknown as { rows: Array<{ id: string }> };
  return result.rows[0]?.id ?? null;
}

async function ensureCustomer(userId: string, email: string, name: string): Promise<string> {
  return db.transaction(async (tx) => {
    const rows = await tx.execute(sql`
      SELECT stripe_customer_id FROM study_users
      WHERE id = ${userId} FOR UPDATE
    `) as unknown as { rows: Array<{ stripe_customer_id: string | null }> };
    const existing = rows.rows[0]?.stripe_customer_id;
    if (existing) return existing;
    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { studyUserId: userId },
    });
    await tx
      .update(studyUsersTable)
      .set({ stripeCustomerId: customer.id })
      .where(eq(studyUsersTable.id, userId));
    return customer.id;
  });
}

router.post("/checkout", async (req, res) => {
  const user = req.studyUser!;
  const { priceId, successUrl, cancelUrl } = req.body;

  if (!priceId || !successUrl || !cancelUrl) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const customerId = await ensureCustomer(user.id, user.email, user.name);
  const stripe = await getUncachableStripeClient();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { studyUserId: user.id },
  });

  res.json({ sessionId: session.id, url: session.url ?? "" });
});

router.post("/portal", async (req, res) => {
  const user = req.studyUser!;
  if (!user.stripeCustomerId) {
    res.status(400).json({ error: "No Stripe customer" });
    return;
  }
  const stripe = await getUncachableStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: req.body.returnUrl ?? `${publicBaseUrl()}/study/settings`,
  });
  res.json({ url: session.url ?? "" });
});

export default router;
