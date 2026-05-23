// Seed the Paideia-Ren "Unlimited" subscription product + monthly price.
// Idempotent: skips creation if a product tagged paideia_plan=unlimited
// already exists. Run with:
//   pnpm --filter @workspace/scripts exec tsx src/seed-products.ts
import { getUncachableStripeClient } from "./stripeClient.js";

const PLAN_NAME = "Paideia-Ren Unlimited";
const PRICE_USD_CENTS = 900;

async function main(): Promise<void> {
  const stripe = await getUncachableStripeClient();

  const existing = await stripe.products.search({
    query: "metadata['paideia_plan']:'unlimited'",
  });
  if (existing.data.length > 0) {
    const product = existing.data[0]!;
    console.log(`Product already exists: ${product.id} (${product.name})`);
    const prices = await stripe.prices.list({ product: product.id, active: true });
    if (prices.data.length === 0) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: PRICE_USD_CENTS,
        currency: "usd",
        recurring: { interval: "month" },
      });
      console.log(`Created price ${price.id} for existing product`);
    } else {
      console.log(`Existing price(s): ${prices.data.map((p) => p.id).join(", ")}`);
    }
    return;
  }

  const product = await stripe.products.create({
    name: PLAN_NAME,
    description: "Unlimited AI generations for Paideia-Ren teachers.",
    metadata: { paideia_plan: "unlimited" },
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRICE_USD_CENTS,
    currency: "usd",
    recurring: { interval: "month" },
  });
  console.log(`Created product ${product.id} and price ${price.id}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
