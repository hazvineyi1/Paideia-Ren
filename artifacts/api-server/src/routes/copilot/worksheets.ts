import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, worksheetsTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth, requireActiveTeacher } from "../../middlewares/auth.js";
import { REGION_IDS } from "../../lib/catalog.js";
import { generateJSON } from "../../lib/openai.js";
import { logEvent } from "../../lib/eventLog.js";
import { worksheetPrompt } from "../../lib/prompts.js";

const router: IRouter = Router();
router.use(requireAuth, requireActiveTeacher);

const createSchema = z.object({
  region: z.string().refine((v) => REGION_IDS.includes(v)),
  subject: z.string().min(1).max(120),
  yearGroup: z.string().min(1).max(40),
  topic: z.string().min(2).max(500),
  difficulty: z.enum(["support", "core", "stretch", "mixed"]).default("core"),
  questionCount: z.number().int().min(3).max(30).default(10),
  notes: z.string().max(1000).optional(),
});

interface WorksheetContent {
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
    const prompt = worksheetPrompt(parsed.data);
    const content = await generateJSON<WorksheetContent>(prompt.system, prompt.user, {
      teacherId: req.teacher!.id,
      kind: "worksheet",
    });
    const title =
      (typeof content.title === "string" && content.title) ||
      `${parsed.data.subject} worksheet: ${parsed.data.topic}`;
    const [worksheet] = await db
      .insert(worksheetsTable)
      .values({
        teacherId: req.teacher!.id,
        title,
        region: parsed.data.region,
        subject: parsed.data.subject,
        yearGroup: parsed.data.yearGroup,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        questionCount: parsed.data.questionCount,
        content,
      })
      .returning();
    void logEvent(req, "worksheet_created", {
      subject: parsed.data.subject,
      yearGroup: parsed.data.yearGroup,
      region: parsed.data.region,
      difficulty: parsed.data.difficulty,
      questionCount: parsed.data.questionCount,
      resourceId: worksheet?.id,
    }, { surface: "app" });
    res.json({ worksheet });
  } catch (err) {
    req.log?.error({ err }, "worksheet generation failed");
    res.status(500).json({ error: "Generation failed. Please try again." });
  }
});

router.get("/", async (req, res) => {
  const worksheets = await db
    .select()
    .from(worksheetsTable)
    .where(eq(worksheetsTable.teacherId, req.teacher!.id))
    .orderBy(desc(worksheetsTable.createdAt))
    .limit(100);
  res.json({ worksheets });
});

router.get("/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  const rows = await db
    .select()
    .from(worksheetsTable)
    .where(
      and(eq(worksheetsTable.id, id), eq(worksheetsTable.teacherId, req.teacher!.id)),
    )
    .limit(1);
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ worksheet: rows[0] });
});

router.delete("/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  await db
    .delete(worksheetsTable)
    .where(
      and(eq(worksheetsTable.id, id), eq(worksheetsTable.teacherId, req.teacher!.id)),
    );
  res.json({ ok: true });
});

export default router;
