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
app.use(cors());
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

app.use(express.static(reactBuildPath));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(reactBuildPath, "index.html"));
});

export default app;
