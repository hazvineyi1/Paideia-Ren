import { Router, type IRouter } from "express";
import { db, studyCouponsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireStudyAdmin } from "../../middlewares/auth.js";
import { normalizeCode } from "../../lib/billing/coupons.js";
import { isTier } from "../../lib/billing/config.js";

const router: IRouter = Router();
router.use(requireStudyAdmin);

const CURRENCIES = ["USD", "ZAR", "ZMW", "BWP"];

interface CouponInput {
  code?: unknown;
  description?: unknown;
  discountType?: unknown;
  percentOff?: unknown;
  amountOffMinor?: unknown;
  currency?: unknown;
  appliesToTier?: unknown;
  active?: unknown;
  maxRedemptions?: unknown;
  expiresAt?: unknown;
}

// Validate + normalize a coupon payload. Returns either parsed values or an error
// string for the caller to surface as a 400.
function parseCoupon(body: CouponInput): { error: string } | {
  values: {
    code: string;
    description: string | null;
    discountType: string;
    percentOff: number | null;
    amountOffMinor: number | null;
    currency: string | null;
    appliesToTier: string | null;
    active: boolean;
    maxRedemptions: number | null;
    expiresAt: Date | null;
  };
} {
  const discountType = body.discountType;
  if (discountType !== "percent" && discountType !== "fixed") {
    return { error: "discountType must be 'percent' or 'fixed'" };
  }

  let percentOff: number | null = null;
  let amountOffMinor: number | null = null;
  let currency: string | null = null;

  if (discountType === "percent") {
    const pct = Number(body.percentOff);
    if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
      return { error: "percentOff must be between 1 and 100" };
    }
    percentOff = Math.round(pct);
  } else {
    const amt = Number(body.amountOffMinor);
    if (!Number.isFinite(amt) || amt < 1) {
      return { error: "amountOffMinor must be a positive integer (minor units)" };
    }
    amountOffMinor = Math.round(amt);
    if (typeof body.currency !== "string" || !CURRENCIES.includes(body.currency)) {
      return { error: `currency must be one of ${CURRENCIES.join(", ")} for fixed coupons` };
    }
    currency = body.currency;
  }

  let appliesToTier: string | null = null;
  if (body.appliesToTier != null && body.appliesToTier !== "") {
    if (!isTier(body.appliesToTier)) {
      return { error: "appliesToTier must be 'plus', 'pro', or empty" };
    }
    appliesToTier = body.appliesToTier;
  }

  let maxRedemptions: number | null = null;
  if (body.maxRedemptions != null && body.maxRedemptions !== "") {
    const max = Number(body.maxRedemptions);
    if (!Number.isFinite(max) || max < 1) {
      return { error: "maxRedemptions must be a positive integer or empty" };
    }
    maxRedemptions = Math.round(max);
  }

  let expiresAt: Date | null = null;
  if (body.expiresAt != null && body.expiresAt !== "") {
    const d = new Date(body.expiresAt as string);
    if (Number.isNaN(d.getTime())) {
      return { error: "expiresAt must be a valid date or empty" };
    }
    expiresAt = d;
  }

  return {
    values: {
      code: typeof body.code === "string" ? normalizeCode(body.code) : "",
      description:
        typeof body.description === "string" && body.description.trim()
          ? body.description.trim()
          : null,
      discountType,
      percentOff,
      amountOffMinor,
      currency,
      appliesToTier,
      active: body.active === undefined ? true : Boolean(body.active),
      maxRedemptions,
      expiresAt,
    },
  };
}

// List all coupons, newest first.
router.get("/coupons", async (_req, res) => {
  const coupons = await db
    .select()
    .from(studyCouponsTable)
    .orderBy(desc(studyCouponsTable.createdAt));
  res.json({ coupons });
});

// Create a coupon.
router.post("/coupons", async (req, res) => {
  const parsed = parseCoupon(req.body ?? {});
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  if (!parsed.values.code) {
    res.status(400).json({ error: "A coupon code is required" });
    return;
  }

  const existing = await db
    .select({ id: studyCouponsTable.id })
    .from(studyCouponsTable)
    .where(eq(studyCouponsTable.code, parsed.values.code))
    .limit(1);
  if (existing[0]) {
    res.status(409).json({ error: "A coupon with that code already exists" });
    return;
  }

  const inserted = await db
    .insert(studyCouponsTable)
    .values(parsed.values)
    .returning();
  res.status(201).json({ coupon: inserted[0] });
});

// Update a coupon.
router.patch("/coupons/:id", async (req, res) => {
  const parsed = parseCoupon(req.body ?? {});
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  if (!parsed.values.code) {
    res.status(400).json({ error: "A coupon code is required" });
    return;
  }

  // Guard against renaming onto another coupon's code.
  const clash = await db
    .select({ id: studyCouponsTable.id })
    .from(studyCouponsTable)
    .where(eq(studyCouponsTable.code, parsed.values.code))
    .limit(1);
  if (clash[0] && clash[0].id !== req.params.id) {
    res.status(409).json({ error: "A coupon with that code already exists" });
    return;
  }

  const updated = await db
    .update(studyCouponsTable)
    .set(parsed.values)
    .where(eq(studyCouponsTable.id, req.params.id))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }
  res.json({ coupon: updated[0] });
});

// Delete a coupon.
router.delete("/coupons/:id", async (req, res) => {
  const deleted = await db
    .delete(studyCouponsTable)
    .where(eq(studyCouponsTable.id, req.params.id))
    .returning({ id: studyCouponsTable.id });
  if (!deleted[0]) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
