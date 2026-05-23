import { Router, type IRouter } from "express";
import { db, teachersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireActiveTeacher } from "../../middlewares/auth.js";
import { getUsage } from "../../middlewares/quota.js";

const router: IRouter = Router();
router.use(requireAuth, requireActiveTeacher);

router.get("/usage", async (req, res) => {
  const t = req.teacher!;
  const usage = await getUsage(t.id, t.subscriptionStatus, t.subscriptionCurrentPeriodEnd);
  res.json(usage);
});

// Stripe checkout + portal endpoints are added in a later step once the
// Stripe connector is authorized. For now this stub returns a friendly
// 503 so the Upgrade page can show a "coming soon" message rather than
// a generic error.
router.post("/checkout", async (_req, res) => {
  res.status(503).json({
    error: "Stripe checkout is not configured yet. Ask the founder to finish connecting payments.",
    code: "stripe_not_configured",
  });
});

router.post("/portal", async (_req, res) => {
  res.status(503).json({
    error: "Stripe billing portal is not configured yet.",
    code: "stripe_not_configured",
  });
});

// Founder-only manual override: granting and revoking a subscription
// without Stripe. Useful for pilots, comp accounts, and testing.
router.post("/admin-set-status", async (req, res) => {
  const t = req.teacher!;
  // Reuse ADMIN_EMAILS-derived isAdmin from the serialised teacher: cheaper
  // than re-importing adminEmails here. Anyone may hit this route, so we
  // re-check the env list directly.
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
