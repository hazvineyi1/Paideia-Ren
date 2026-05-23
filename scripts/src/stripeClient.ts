// Stripe client for scripts (e.g. seed-products). Mirrors the api-server
// version so seed scripts can run against the connected Stripe account.
import Stripe from "stripe";

async function getCredentials(): Promise<{ publishableKey: string; secretKey: string }> {
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = process.env["REPL_IDENTITY"]
    ? "repl " + process.env["REPL_IDENTITY"]
    : process.env["WEB_REPL_RENEWAL"]
      ? "depl " + process.env["WEB_REPL_RENEWAL"]
      : null;
  if (!xReplitToken) throw new Error("X-Replit-Token not found for repl/depl");

  const isProduction = process.env["REPLIT_DEPLOYMENT"] === "1";
  const targetEnvironment = isProduction ? "production" : "development";
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", "stripe");
  url.searchParams.set("environment", targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
  });
  const data = (await response.json()) as { items?: Array<{ settings: { publishable: string; secret: string } }> };
  const conn = data.items?.[0];
  if (!conn || !conn.settings.publishable || !conn.settings.secret) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }
  return { publishableKey: conn.settings.publishable, secretKey: conn.settings.secret };
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, { apiVersion: "2025-11-17.clover" });
}
