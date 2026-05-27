import { Router, type IRouter } from "express";
import authRouter from "./auth.js";
import materialsRouter from "./materials.js";
import flashcardsRouter from "./flashcards.js";
import practiceRouter from "./practice.js";
import examsRouter from "./exams.js";
import tutorRouter from "./tutor.js";
import profileRouter from "./profile.js";
import briefsRouter from "./briefs.js";
import dashboardRouter from "./dashboard.js";
import billingRouter from "./billing.js";

const router: IRouter = Router();

router.use("/auth", authRouter);
router.use("/materials", materialsRouter);
router.use("/flashcards", flashcardsRouter);
router.use("/practice", practiceRouter);
router.use("/exams", examsRouter);
router.use("/tutor", tutorRouter);
router.use("/profile", profileRouter);
router.use("/briefs", briefsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/billing", billingRouter);

export default router;
