import app from "./app";
import { logger } from "./lib/logger";
import { getStripeSync } from "./lib/stripeClient";

async function initStripe(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set; skipping Stripe init");
    return;
  }
  try {
    const { runMigrations } = await import("stripe-replit-sync");
    await runMigrations({ databaseUrl });
    const sync = await getStripeSync();
    const replitDomain = process.env["REPLIT_DOMAINS"]?.split(",")[0];
    if (replitDomain) {
      const webhookUrl = `https://${replitDomain}/api/stripe/webhook`;
      await sync.findOrCreateManagedWebhook(webhookUrl);
      logger.info({ webhookUrl }, "Stripe managed webhook ready");
    }
    await sync.syncBackfill();
    logger.info("Stripe sync complete");
  } catch (err) {
    logger.error({ err }, "Stripe initialisation failed");
  }
}

void initStripe();

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
