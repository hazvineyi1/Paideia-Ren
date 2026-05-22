import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, quizzesTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth.js";
import { REGION_IDS } from "../../lib/catalog.js";
import { generateJSON } from "../../lib/openai.js";
import { quizPrompt } from "../../lib/prompts.js";

const router: IRouter = Router();
router.use(requireAuth);

const createSchema = z.object({
  region: z.string().refine((v) => REGION_IDS.includes(v)),
  subject: z.string().min(1).max(120),
  yearGroup: z.string().min(1).max(40),
  topic: z.string().min(2).max(500),
  format: z
    .enum(["exit ticket", "starter quiz", "mid-unit check", "end-of-unit assessment"])
    .default("exit ticket"),
  questionCount: z.number().int().min(3).max(20).default(5),
  notes: z.string().max(1000).optional(),
});

interface QuizContent {
  title?: string;
  [k: string]: unknown;
}

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const prompt = quizPrompt(parsed.data);
    const content = await generateJSON<QuizContent>(prompt.system, prompt.user);
    const title =
      (typeof content.title === "string" && content.title) ||
      `${parsed.data.subject} ${parsed.data.format}: ${parsed.data.topic}`;
    const [quiz] = await db
      .insert(quizzesTable)
      .values({
        teacherId: req.teacher!.id,
        title,
        region: parsed.data.region,
        subject: parsed.data.subject,
        yearGroup: parsed.data.yearGroup,
        topic: parsed.data.topic,
        format: parsed.data.format,
        questionCount: parsed.data.questionCount,
        content,
      })
      .returning();
    res.json({ quiz });
  } catch (err) {
    req.log?.error({ err }, "quiz generation failed");
    res.status(500).json({ error: "Generation failed. Please try again." });
  }
});

router.get("/", async (req, res) => {
  const quizzes = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.teacherId, req.teacher!.id))
    .orderBy(desc(quizzesTable.createdAt))
    .limit(100);
  res.json({ quizzes });
});

router.get("/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  const rows = await db
    .select()
    .from(quizzesTable)
    .where(
      and(eq(quizzesTable.id, id), eq(quizzesTable.teacherId, req.teacher!.id)),
    )
    .limit(1);
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ quiz: rows[0] });
});

router.delete("/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  await db
    .delete(quizzesTable)
    .where(
      and(eq(quizzesTable.id, id), eq(quizzesTable.teacherId, req.teacher!.id)),
    );
  res.json({ ok: true });
});

export default router;
