import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  db,
  studyMockExamsTable,
  studyConceptsTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireStudyUser } from "../../middlewares/auth.js";
import { generateJSON } from "../../lib/openai.js";
import { randomUUID } from "crypto";

const router: IRouter = Router();
router.use(requireStudyUser);

const createExamSchema = z.object({
  title: z.string().min(1).optional(),
  materialId: z.string().nullable().optional(),
  conceptIds: z.array(z.string()).optional(),
  questionCount: z.number().int().min(5).max(50).default(20),
  timeLimitMinutes: z.number().int().min(5).max(180).default(30),
});

const submitExamSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIndex: z.number().int(),
    }),
  ),
  timeSpentSeconds: z.number().int().min(0),
});

router.get("/", async (req, res) => {
  const userId = req.studyUser!.id;
  const rows = await db
    .select()
    .from(studyMockExamsTable)
    .where(eq(studyMockExamsTable.userId, userId))
    .orderBy(desc(studyMockExamsTable.createdAt));
  res.json(rows);
});

router.post("/", async (req, res) => {
  const parsed = createExamSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const data = parsed.data;
  const userId = req.studyUser!.id;

  let concepts: { id: string; title: string; explanation: string }[] = [];
  if (data.conceptIds && data.conceptIds.length > 0) {
    concepts = await db
      .select()
      .from(studyConceptsTable)
      .where(and(eq(studyConceptsTable.userId, userId), eq(studyConceptsTable.id, data.conceptIds[0])))
      .limit(20);
  } else if (data.materialId) {
    concepts = await db
      .select()
      .from(studyConceptsTable)
      .where(and(eq(studyConceptsTable.userId, userId), eq(studyConceptsTable.materialId, data.materialId)))
      .limit(20);
  } else {
    concepts = await db
      .select()
      .from(studyConceptsTable)
      .where(eq(studyConceptsTable.userId, userId))
      .limit(20);
  }

  const conceptTexts = concepts.map((c) => `Concept: ${c.title}\n${c.explanation}`).join("\n\n");

  let questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    conceptId: string | null;
    points: number;
  }> = [];

  try {
    const aiQuestions = await generateJSON<
      Array<{
        prompt: string;
        options: string[];
        correctOptionIndex: number;
        explanation: string;
        difficulty: string;
        points: number;
      }>
    >(
      "You are an expert exam writer. Generate exam questions with varying difficulty. Each question has 4 options. Return JSON array of questions. Include difficulty and points (1-5) for each.",
      `Generate ${Math.min(data.questionCount, 10)} exam questions from these concepts:\n\n${conceptTexts.slice(0, 4000)}`,
      { kind: "study_exam_questions" },
    );

    questions = aiQuestions.map((q, i) => ({
      id: randomUUID(),
      prompt: q.prompt,
      options: q.options.slice(0, 4),
      correctOptionIndex: Math.max(0, Math.min(3, q.correctOptionIndex)),
      explanation: q.explanation,
      conceptId: concepts[i % concepts.length]?.id ?? null,
      points: Math.max(1, Math.min(5, q.points ?? 1)),
    }));
  } catch (err) {
    req.log?.warn({ err }, "AI exam generation failed, using fallback");
    questions = concepts.slice(0, data.questionCount).map((c) => ({
      id: randomUUID(),
      prompt: `Explain: ${c.title}`,
      options: [`Correct: ${c.explanation.slice(0, 50)}...`, "Wrong A", "Wrong B", "Wrong C"],
      correctOptionIndex: 0,
      explanation: c.explanation,
      conceptId: c.id,
      points: 1,
    }));
  }

  const title = data.title ?? `Mock Exam ${new Date().toLocaleDateString()}`;
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

  const [exam] = await db
    .insert(studyMockExamsTable)
    .values({
      userId,
      materialId: data.materialId ?? null,
      title,
      questionCount: questions.length,
      timeLimitMinutes: data.timeLimitMinutes,
      questions,
      maxScore,
    })
    .returning();

  res.status(201).json(exam);
});

router.get("/:examId", async (req, res) => {
  const userId = req.studyUser!.id;
  const examId = req.params.examId;
  const rows = await db
    .select()
    .from(studyMockExamsTable)
    .where(and(eq(studyMockExamsTable.userId, userId), eq(studyMockExamsTable.id, examId)))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(rows[0]);
});

router.post("/:examId/submit", async (req, res) => {
  const userId = req.studyUser!.id;
  const examId = req.params.examId;
  const parsed = submitExamSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { answers, timeSpentSeconds } = parsed.data;

  const rows = await db
    .select()
    .from(studyMockExamsTable)
    .where(and(eq(studyMockExamsTable.userId, userId), eq(studyMockExamsTable.id, examId)))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const exam = rows[0];

  let score = 0;
  const conceptStats: Record<string, { correct: number; total: number; title: string }> = {};

  for (const answer of answers) {
    const q = exam.questions.find((qq: { id: string; correctOptionIndex: number; points: number; prompt: string; conceptId: string | null }) => qq.id === answer.questionId);
    if (!q) continue;
    const correct = answer.selectedOptionIndex === q.correctOptionIndex;
    if (correct) score += q.points;

    if (q.conceptId) {
      const s = conceptStats[q.conceptId] ?? { correct: 0, total: 0, title: q.prompt.slice(0, 30) };
      s.total++;
      if (correct) s.correct++;
      conceptStats[q.conceptId] = s;
    }
  }

  const maxScore = exam.maxScore ?? exam.questionCount;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const correctCount = answers.filter((a) => {
    const q = exam.questions.find((qq: { id: string; correctOptionIndex: number }) => qq.id === a.questionId);
    return q && a.selectedOptionIndex === q.correctOptionIndex;
  }).length;

  await db
    .update(studyMockExamsTable)
    .set({
      answers,
      score,
      status: "completed",
      timeSpentSeconds,
      completedAt: new Date(),
    })
    .where(eq(studyMockExamsTable.id, examId));

  const conceptBreakdown = Object.entries(conceptStats).map(([conceptId, stats]) => ({
    conceptId,
    conceptTitle: stats.title,
    correct: stats.correct,
    total: stats.total,
    percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
  }));

  res.json({
    score,
    maxScore,
    percentage,
    correctCount,
    timeSpentSeconds,
    conceptBreakdown,
  });
});

export default router;
