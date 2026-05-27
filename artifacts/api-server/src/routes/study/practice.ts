import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  db,
  studyPracticeSessionsTable,
  studyConceptsTable,
  studyFlashcardsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireStudyUser } from "../../middlewares/auth.js";
import { generateJSON } from "../../lib/openai.js";
import { randomUUID } from "crypto";

const router: IRouter = Router();
router.use(requireStudyUser);

const createInputSchema = z.object({
  materialId: z.string().nullable().optional(),
  conceptIds: z.array(z.string()).optional(),
  questionCount: z.number().int().min(1).max(50).default(10),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).default("mixed"),
});

const answerInputSchema = z.object({
  questionId: z.string(),
  selectedOptionIndex: z.number().int(),
  confidence: z.number().int().min(1).max(5),
});

router.post("/", async (req, res) => {
  const parsed = createInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const data = parsed.data;
  const userId = req.studyUser!.id;

  // Load concepts for question generation
  let concepts: { id: string; title: string; explanation: string; difficulty: string }[] = [];
  if (data.conceptIds && data.conceptIds.length > 0) {
    concepts = await db
      .select()
      .from(studyConceptsTable)
      .where(and(eq(studyConceptsTable.userId, userId), eq(studyConceptsTable.id, data.conceptIds[0])));
    // For simplicity, take first few matching concepts
    concepts = concepts.slice(0, 10);
  } else if (data.materialId) {
    concepts = await db
      .select()
      .from(studyConceptsTable)
      .where(and(eq(studyConceptsTable.userId, userId), eq(studyConceptsTable.materialId, data.materialId)))
      .limit(15);
  } else {
    concepts = await db
      .select()
      .from(studyConceptsTable)
      .where(eq(studyConceptsTable.userId, userId))
      .limit(15);
  }

  const conceptTexts = concepts.map((c) => `Concept: ${c.title}\n${c.explanation}`).join("\n\n");

  let questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    conceptId: string | null;
    difficulty: string;
  }> = [];

  try {
    const aiQuestions = await generateJSON<
      Array<{
        prompt: string;
        options: string[];
        correctOptionIndex: number;
        explanation: string;
        difficulty: string;
      }>
    >(
      "You are an expert test writer. Generate multiple-choice questions based on the provided concepts. Each question must have 4 options, only one correct. Return JSON with an array of questions.",
      `Generate ${Math.min(data.questionCount, 5)} questions from these concepts:\n\n${conceptTexts.slice(0, 4000)}`,
      { kind: "study_practice_questions" },
    );

    questions = aiQuestions.map((q, i) => ({
      id: randomUUID(),
      prompt: q.prompt,
      options: q.options.slice(0, 4),
      correctOptionIndex: Math.max(0, Math.min(3, q.correctOptionIndex)),
      explanation: q.explanation,
      conceptId: concepts[i % concepts.length]?.id ?? null,
      difficulty: q.difficulty ?? "medium",
    }));
  } catch (err) {
    req.log?.warn({ err }, "AI question generation failed, using fallback");
    // Fallback: simple recall questions from flashcards
    const flashcards = await db
      .select()
      .from(studyFlashcardsTable)
      .where(eq(studyFlashcardsTable.userId, userId))
      .limit(data.questionCount);

    questions = flashcards.map((f) => ({
      id: randomUUID(),
      prompt: f.front,
      options: [f.back, "Incorrect option A", "Incorrect option B", "Incorrect option C"],
      correctOptionIndex: 0,
      explanation: f.back,
      conceptId: f.conceptId,
      difficulty: "medium",
    }));
  }

  const [session] = await db
    .insert(studyPracticeSessionsTable)
    .values({
      userId,
      materialId: data.materialId ?? null,
      status: "active",
      questionCount: questions.length,
      questions,
    })
    .returning();

  res.status(201).json({
    ...session,
    currentQuestion: questions[0] ?? null,
  });
});

router.get("/:sessionId", async (req, res) => {
  const userId = req.studyUser!.id;
  const sessionId = req.params.sessionId;
  const rows = await db
    .select()
    .from(studyPracticeSessionsTable)
    .where(and(eq(studyPracticeSessionsTable.userId, userId), eq(studyPracticeSessionsTable.id, sessionId)))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const session = rows[0];
  const nextQ = session.questions[session.answeredCount] ?? null;
  res.json({
    ...session,
    currentQuestion: nextQ,
  });
});

router.post("/:sessionId/answer", async (req, res) => {
  const userId = req.studyUser!.id;
  const sessionId = req.params.sessionId;
  const parsed = answerInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { questionId, selectedOptionIndex, confidence } = parsed.data;

  const rows = await db
    .select()
    .from(studyPracticeSessionsTable)
    .where(and(eq(studyPracticeSessionsTable.userId, userId), eq(studyPracticeSessionsTable.id, sessionId)))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const session = rows[0];

  const question = session.questions.find((q: { id: string; correctOptionIndex: number }) => q.id === questionId);
  if (!question) {
    res.status(400).json({ error: "Question not found in session" });
    return;
  }

  const correct = selectedOptionIndex === question.correctOptionIndex;
  const newAnswers = [
    ...session.answers,
    {
      questionId,
      selectedOptionIndex,
      confidence,
      correct,
      answeredAt: new Date().toISOString(),
    },
  ];

  const answeredCount = session.answeredCount + 1;
  const correctCount = session.correctCount + (correct ? 1 : 0);
  const isComplete = answeredCount >= session.questionCount;

  await db
    .update(studyPracticeSessionsTable)
    .set({
      answers: newAnswers,
      answeredCount,
      correctCount,
      status: isComplete ? "completed" : "active",
      completedAt: isComplete ? new Date() : null,
    })
    .where(eq(studyPracticeSessionsTable.id, sessionId));

  if (isComplete) {
    // Identify weak and strong concepts
    const weakConcepts: string[] = [];
    const strongConcepts: string[] = [];
    const conceptStats: Record<string, { correct: number; total: number }> = {};

    for (const a of newAnswers) {
      const q = session.questions.find((qq: { id: string; conceptId: string | null }) => qq.id === a.questionId);
      if (q?.conceptId) {
        const s = conceptStats[q.conceptId] ?? { correct: 0, total: 0 };
        s.total++;
        if (a.correct) s.correct++;
        conceptStats[q.conceptId] = s;
      }
    }

    const conceptDetails = await db
      .select()
      .from(studyConceptsTable)
      .where(eq(studyConceptsTable.userId, userId));

    for (const [conceptId, stats] of Object.entries(conceptStats)) {
      const pct = stats.correct / stats.total;
      const title = conceptDetails.find((c) => c.id === conceptId)?.title ?? "Unknown";
      if (pct < 0.6) weakConcepts.push(title);
      else if (pct >= 0.8) strongConcepts.push(title);
    }

    res.json({
      correct,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation,
      nextQuestion: null,
      sessionComplete: true,
      sessionSummary: {
        totalQuestions: session.questionCount,
        correctCount,
        accuracy: correctCount / session.questionCount,
        weakConcepts,
        strongConcepts,
        timeSeconds: Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000),
      },
    });
  } else {
    const nextQuestion = session.questions[answeredCount];
    res.json({
      correct,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation,
      nextQuestion,
      sessionComplete: false,
      sessionSummary: null,
    });
  }
});

export default router;
