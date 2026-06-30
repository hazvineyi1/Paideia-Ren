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
