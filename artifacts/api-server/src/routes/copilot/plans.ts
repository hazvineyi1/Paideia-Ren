import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, lessonPlansTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth.js";
import { REGION_IDS } from "../../lib/catalog.js";
import { generateJSON } from "../../lib/openai.js";
import { lessonPlanPrompt } from "../../lib/prompts.js";

const router: IRouter = Router();
router.use(requireAuth);

const createSchema = z.object({
  region: z.string().refine((v) => REGION_IDS.includes(v)),
  subject: z.string().min(1).max(120),
  yearGroup: z.string().min(1).max(40),
  topic: z.string().min(2).max(500),
  priorKnowledge: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(15).max(180).default(50),
  groupContext: z.string().max(1000).optional(),
});

interface LessonPlanContent {
  title?: string;
  [k: string]: unknown;
}

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  try {
    const prompt = lessonPlanPrompt(parsed.data);
    const content = await generateJSON<LessonPlanContent>(prompt.system, prompt.user);
    const title =
      (typeof content.title === "string" && content.title) ||
      `${parsed.data.subject}: ${parsed.data.topic}`;
    const [plan] = await db
      .insert(lessonPlansTable)
      .values({
        teacherId: req.teacher!.id,
        title,
        region: parsed.data.region,
        subject: parsed.data.subject,
        yearGroup: parsed.data.yearGroup,
        topic: parsed.data.topic,
        priorKnowledge: parsed.data.priorKnowledge ?? null,
        durationMinutes: parsed.data.durationMinutes,
        groupContext: parsed.data.groupContext ?? null,
        content,
      })
      .returning();
    res.json({ plan });
  } catch (err) {
    req.log?.error({ err }, "lesson plan generation failed");
    res.status(500).json({ error: "Generation failed. Please try again." });
  }
});

router.get("/", async (req, res) => {
  const plans = await db
    .select()
    .from(lessonPlansTable)
    .where(eq(lessonPlansTable.teacherId, req.teacher!.id))
    .orderBy(desc(lessonPlansTable.createdAt))
    .limit(100);
  res.json({ plans });
});

router.get("/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  const rows = await db
    .select()
    .from(lessonPlansTable)
    .where(
      and(eq(lessonPlansTable.id, id), eq(lessonPlansTable.teacherId, req.teacher!.id)),
    )
    .limit(1);
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ plan: rows[0] });
});

router.delete("/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  await db
    .delete(lessonPlansTable)
    .where(
      and(eq(lessonPlansTable.id, id), eq(lessonPlansTable.teacherId, req.teacher!.id)),
    );
  res.json({ ok: true });
});

export default router;
