---
name: Study (Coach) multi-provider billing
description: Non-obvious constraints for the paideia-study African mobile-money + card billing layer (Paynow/Flutterwave/Stripe/mock).
---

# Coach billing constraints

## Resolve a payment's provider by the stored row, not by current env
After a payment is initiated, always re-resolve its gateway via `getProviderById(payment.provider)` (the value persisted on `study_payments.provider`), never via `resolveProvider(country, method)`.
**Why:** `resolveProvider` picks the live gateway only if keys are configured, else the `mock` provider. If keys are added/removed while a payment is pending, country-based resolution diverges from the gateway that actually started the payment, so polling/webhooks check the wrong gateway and the payment gets stuck.
**How to apply:** Used in the poll endpoint (`routes/study/billing.ts`) and both mobile-money webhooks (`app.ts`). Initiation is the only place that may use `resolveProvider`.

## Stripe card auto-renew must be gated to a Coach-specific product
`findActivePriceId` for the Coach requires `stripe.products.metadata->>'paideia_plan' = 'coach'` AND matching recurring interval.
**Why:** The same Stripe account also holds the Teacher ("unlimited") plan. Without the metadata filter, the query grabbed any active recurring price and would charge a Coach learner the Teacher price.
**How to apply:** To enable real card auto-renew for the Coach, create a Stripe product with metadata `paideia_plan=coach` and monthly/yearly recurring prices. Until then `/billing/card/checkout` returns 409 and the Upgrade screen falls back to a one-time card charge through the local gateway (Flutterwave/Paynow/mock).

## Stripe webhook must sync study users too
The shared `/api/stripe/webhook` historically only called `syncTeacherFromCustomer`. It also calls `activateStudyStripeFromCustomer(customerId)` so card subscriptions reflect onto `study_users`. The helper is a no-op when the customer is not a study learner.

## Stripe API: current_period_end lives on the subscription item
In recent Stripe API versions `current_period_end` is on `subscription.items.data[i]`, NOT on the subscription object. Reading `sub.current_period_end` fails tsc ("Property does not exist on type Subscription"). Use `sub.items.data[0].current_period_end`.

## Sandbox/mock fallback
With no merchant keys, providers' `isConfigured()` is false so `resolveProvider` returns the `mock` provider: a stateless poll that reports `paid` ~6s after initiation. This makes the whole checkout->poll->activate->Pro flow testable end to end without any keys. Go-live envs: `PAYNOW_INTEGRATION_ID/KEY`, `FLUTTERWAVE_SECRET_KEY/SECRET_HASH`. Flutterwave webhook is fail-closed in production when `FLUTTERWAVE_SECRET_HASH` is unset.

## Mock activation is lazy and owner-scoped (matters for e2e tests)
The mock payment does NOT flip to `paid` on a background timer. It reports `paid` only when the **owner's** session polls `GET /billing/payment/:id` after the ~6s window. So an e2e curl test must keep the original signup cookie jar and poll that endpoint to drive activation; sleeping then querying the DB leaves the row `pending`, and an admin/non-owner cookie cannot trigger it. Restarting api-server between checkout and activation is fine (mock is stateless).

## Coupon redemption cap must be enforced atomically at increment time
`previewCoupon()` checks `timesRedeemed < maxRedemptions` at checkout, but the count is only bumped later in `activatePayment()`. That is a TOCTOU gap: two concurrent checkouts both pass preview, then both increment.
**Why:** an unconditional `timesRedeemed = timesRedeemed + 1` lets concurrent last-redemption checkouts oversubscribe the cap.
**How to apply:** the increment UPDATE is guarded in the same statement: `WHERE code=? AND (max_redemptions IS NULL OR times_redeemed < max_redemptions)`. PostgreSQL evaluates this per-row atomically, so an at-cap coupon increments 0 rows (counter holds). Note this caps the *counter* only; a rare concurrent overage still grants the discount to the extra payment (acceptable for marketing coupons; reserve-at-checkout would be needed to harden further).

## Tiers: Pro is top, Plus can buy up
3 tiers free|plus|pro (`study_users.subscription_tier`, payment row carries `tier` default 'pro'). Upgrade page (`StudyUpgrade.tsx`): `pro` users get the managed/cancel view; `plus` users see the checkout flow restricted to Pro only (tier locked to 'pro', single tier card); `free` users see both Plus and Pro. Coupons can target a tier via `appliesToTier` (plus|pro|null=any); fixed-amount coupons must match the payment currency or preview rejects them.
