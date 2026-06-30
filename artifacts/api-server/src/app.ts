import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { loadTeacher } from "./middlewares/auth.js";
import { getStripeSync } from "./lib/stripeClient.js";
import { syncTeacherFromCustomer } from "./lib/stripeSync.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reactBuildPath = path.resolve(__dirname, "../../paideia-ren/dist/public");

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: process.env["NODE_ENV"] === "production"
      ? undefined
      : ["http://localhost:25565", "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(cookieParser());

// Stripe webhook must receive the raw body and be registered BEFORE
// express.json(). The handler keeps logic minimal: hand off to
// stripe-replit-sync, then reflect subscription state onto the teacher row.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) { res.status(400).json({ error: "Missing signature" }); return; }
    const sig = Array.isArray(signature) ? signature[0]! : signature;
    try {
      const sync = await getStripeSync();
      const event = await sync.processWebhook(req.body as Buffer, sig);
      const customerId = event?.data?.object?.customer;
      if (typeof customerId === "string" && customerId.length > 0) {
        await syncTeacherFromCustomer(customerId);
      }
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err }, "stripe webhook failed");
      res.status(400).json({ error: "Webhook handling failed" });
    }
  },
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(loadTeacher);

app.use("/api", router);

// Host-based routing for the Coach's own domain (e.g. synopscoach.com).
// All apps live behind one deployment and are routed by path on the primary
// domain (marketing at "/", Coach at "/study/"). Custom domains all hit this
// same server, so when a request arrives on a Coach domain we send the visitor
// straight into the Coach app (served at "/study/") instead of the marketing
// site - they never see marketing. The Coach is built with base "/study/", so
// redirecting (rather than serving its HTML at root) keeps asset and SPA-router
// paths correct. Override the domain list with the COACH_HOSTS env var.
const coachHosts = new Set(
  (process.env["COACH_HOSTS"] ?? "synopscoach.com,www.synopscoach.com")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
);
app.use((req, res, next) => {
  const forwarded = req.headers["x-forwarded-host"];
  const rawHost =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded) ||
    req.headers.host ||
    "";
  const host = rawHost.toString().toLowerCase().split(":")[0];
  if (!coachHosts.has(host)) {
    next();
    return;
  }

  const p = req.path;
  // The shared API is served on every host - let it through untouched. Match
  // only the real "/api" segment, not look-alikes like "/apiary".
  if (p === "/api" || p.startsWith("/api/")) {
    next();
    return;
  }
  // Requests already inside the Coach app (served by the "/study/" path router)
  // are left alone. Use the trailing slash so look-alikes like "/studyfoo" are
  // NOT treated as Coach routes - they must be redirected, or they would fall
  // through to the marketing catch-all and leak marketing on the Coach domain.
  if (p.startsWith("/study/")) {
    next();
    return;
  }

  // Everything else on a Coach host goes into the Coach app at "/study/".
  // Bare "/" and "/study" canonicalize to "/study/"; other paths keep their
  // sub-path (e.g. "/coach" -> "/study/coach").
  const queryIndex = req.originalUrl.indexOf("?");
  const search = queryIndex === -1 ? "" : req.originalUrl.slice(queryIndex);
  const target =
    p === "/" || p === "/study" ? "/study/" + search : "/study" + p + search;
  res.redirect(302, target);
});

app.use(express.static(reactBuildPath));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(reactBuildPath, "index.html"));
});

export default app;
