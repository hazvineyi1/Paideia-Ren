import { Router, type IRouter } from "express";
import authRouter from "./auth.js";
import catalogRouter from "./catalog.js";
import plansRouter from "./plans.js";
import worksheetsRouter from "./worksheets.js";
import parentDraftsRouter from "./parent-drafts.js";
import quizzesRouter from "./quizzes.js";
import samplesRouter from "./samples.js";

const router: IRouter = Router();

router.use("/auth", authRouter);
router.use("/catalog", catalogRouter);
router.use("/plans", plansRouter);
router.use("/worksheets", worksheetsRouter);
router.use("/parent-drafts", parentDraftsRouter);
router.use("/quizzes", quizzesRouter);
router.use("/samples", samplesRouter);

export default router;
