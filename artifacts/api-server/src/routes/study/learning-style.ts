import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, studyLearningStyleProfilesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireStudyUser } from "../../middlewares/auth.js";

const router: IRouter = Router();
router.use(requireStudyUser);

// ─── Static diagnostic content ───
const QUESTIONNAIRE = [
  {
    id: "input_preference",
    prompt: "When you need to learn something new, which feels easiest first?",
    options: [
      { id: "read", label: "Reading a clear explanation", scores: { textPref: 2 } },
      { id: "listen", label: "Hearing someone explain it", scores: { audioPref: 2 } },
      { id: "watch", label: "Watching a diagram or video", scores: { visualPref: 2 } },
      { id: "do", label: "Just trying it and figuring it out", scores: { practicePref: 2 } },
    ],
  },
  {
    id: "remember_best",
    prompt: "What helps you remember something a week later?",
    options: [
      { id: "reread", label: "Rereading notes or summaries", scores: { textPref: 1 } },
      { id: "discuss", label: "Talking it through or hearing it again", scores: { audioPref: 1 } },
      { id: "picture", label: "Picturing it in my head", scores: { visualPref: 1 } },
      { id: "use", label: "Using it on a real problem", scores: { practicePref: 1 } },
    ],
  },
  {
    id: "pace",
    prompt: "How do you usually like to move through new material?",
    options: [
      { id: "deliberate", label: "Slow and thorough — I want to really get it", scores: {}, pace: "deliberate" },
      { id: "moderate", label: "A balanced pace", scores: {}, pace: "moderate" },
      { id: "quick", label: "Fast first, then circle back", scores: {}, pace: "quick" },
    ],
  },
  {
    id: "session_length",
    prompt: "How long can you usually focus before you need a break?",
    options: [
      { id: "15", label: "About 15 minutes", scores: {}, focusMinutes: 15 },
      { id: "25", label: "Around 25 minutes", scores: {}, focusMinutes: 25 },
      { id: "45", label: "45 minutes or more", scores: {}, focusMinutes: 45 },
      { id: "60", label: "An hour or more if I'm into it", scores: {}, focusMinutes: 60 },
    ],
  },
  {
    id: "preferred_session",
    prompt: "Ideally, how long should a single study session be?",
    options: [
      { id: "10", label: "10 minutes — quick wins", scores: {}, preferredSessionMinutes: 10 },
      { id: "25", label: "25 minutes", scores: {}, preferredSessionMinutes: 25 },
      { id: "45", label: "45 minutes", scores: {}, preferredSessionMinutes: 45 },
      { id: "60", label: "60+ minutes", scores: {}, preferredSessionMinutes: 60 },
    ],
  },
  {
    id: "prior_knowledge",
    prompt: "How much do you already know about what you're about to study?",
    options: [
      { id: "none", label: "Almost nothing — total beginner", scores: {}, priorKnowledge: "none" },
      { id: "some", label: "A little — I've seen the basics", scores: {}, priorKnowledge: "some" },
      { id: "strong", label: "A lot — I'm refining what I know", scores: {}, priorKnowledge: "strong" },
    ],
  },
  {
    id: "motivation",
    prompt: "What's driving you most right now?",
    options: [
      { id: "mastery", label: "I want to truly master this", scores: {}, motivationType: "mastery" },
      { id: "deadline", label: "I have an exam or deadline", scores: {}, motivationType: "deadline" },
      { id: "curiosity", label: "Pure curiosity", scores: {}, motivationType: "curiosity" },
      { id: "obligation", label: "I have to learn this", scores: {}, motivationType: "obligation" },
    ],
  },
  {
    id: "study_time",
    prompt: "When do you tend to study best?",
    options: [
      { id: "morning", label: "Morning", scores: {}, studyTime: "morning" },
      { id: "afternoon", label: "Afternoon", scores: {}, studyTime: "afternoon" },
      { id: "evening", label: "Evening", scores: {}, studyTime: "evening" },
      { id: "night", label: "Late night", scores: {}, studyTime: "night" },
      { id: "flexible", label: "It varies", scores: {}, studyTime: "flexible" },
    ],
  },
];

const MINI_TASKS = [
  {
    id: "read",
    modality: "read" as const,
    title: "Read a short passage",
    instruction: "Read the passage below carefully, then answer two questions from memory.",
    passage:
      "Spaced repetition is a learning technique that schedules reviews at increasing intervals — typically right before the learner is likely to forget. Research by Ebbinghaus showed that forgetting follows a predictable curve. By spacing reviews, learners strengthen the memory trace more efficiently than by re-reading material in one sitting (a method known as 'massed practice').",
    questions: [
      {
        id: "r1",
        prompt: "What is the main idea of spaced repetition?",
        options: [
          "Reviewing material many times in one sitting",
          "Spacing reviews at increasing intervals",
          "Reading material out loud",
          "Studying only when motivated",
        ],
        correctOptionIndex: 1,
      },
      {
        id: "r2",
        prompt: "What did Ebbinghaus's research describe?",
        options: [
          "How attention drifts during long lectures",
          "How forgetting follows a predictable curve",
          "How groups solve problems better than individuals",
          "How sleep consolidates motor skills",
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: "listen",
    modality: "listen" as const,
    title: "Imagine you heard this",
    instruction:
      "Read this as if you were listening to a podcast (don't go back — read once and answer). Then answer two questions.",
    passage:
      "Here's the thing about active recall — you sit down, you close the book, and you try to pull the answer out of your own head. It feels harder than just rereading, and that's exactly the point. The struggle is what builds the memory. Re-reading feels productive but it's mostly an illusion.",
    questions: [
      {
        id: "l1",
        prompt: "What technique was the speaker describing?",
        options: ["Mind mapping", "Active recall", "Pomodoro timing", "Mnemonics"],
        correctOptionIndex: 1,
      },
      {
        id: "l2",
        prompt: "Why does the speaker say re-reading feels productive but isn't?",
        options: [
          "Because it takes too long",
          "Because it's an illusion of learning",
          "Because it bores the learner",
          "Because it's only for visual learners",
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: "visual",
    modality: "visual" as const,
    title: "Read a labeled diagram",
    instruction: "Study the diagram description below and then answer two questions.",
    passage:
      "Diagram: 'The Forgetting Curve'. The X-axis is labeled 'Time (days)' from 0 to 7. The Y-axis is labeled 'Memory retention (%)' from 0 to 100. A red curve starts at 100% at day 0 and drops steeply to about 40% by day 1, then flattens, reaching ~25% by day 7. A second green curve sits on top — it represents 'with reviews' and stays above 80% throughout, with small dips at each review point (marked on day 1, day 3, and day 6).",
    questions: [
      {
        id: "v1",
        prompt: "By roughly day 1, what is memory retention WITHOUT reviews?",
        options: ["~90%", "~70%", "~40%", "~10%"],
        correctOptionIndex: 2,
      },
      {
        id: "v2",
        prompt: "How does the green 'with reviews' curve behave?",
        options: [
          "It drops faster than the red curve",
          "It stays above 80% with small dips at reviews",
          "It only kicks in after day 7",
          "It matches the red curve exactly",
        ],
        correctOptionIndex: 1,
      },
    ],
  },
];

// ─── Routes ───
router.get("/profile", async (req, res) => {
  const userId = req.studyUser!.id;
  const [profile] = await db
    .select()
    .from(studyLearningStyleProfilesTable)
    .where(eq(studyLearningStyleProfilesTable.userId, userId))
    .limit(1);
  res.json(profile ?? null);
});

router.get("/tasks", (_req, res) => {
  res.json({ questionnaire: QUESTIONNAIRE, miniTasks: MINI_TASKS });
});

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()),
  miniTaskAnswers: z
    .record(
      z.string(),
      z.array(z.object({ questionId: z.string(), selectedOptionIndex: z.number().int().min(0) })),
    )
    .default({}),
});

router.post("/profile", async (req, res) => {
  const userId = req.studyUser!.id;
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { answers, miniTaskAnswers } = parsed.data;

  // Compute scores from questionnaire
  const prefs = { textPref: 1, audioPref: 1, visualPref: 1, practicePref: 1 };
  let pace = "moderate";
  let preferredSessionMinutes = 25;
  let focusMinutes = 20;
  let motivationType = "mastery";
  let priorKnowledge = "some";
  let studyTime = "flexible";

  for (const q of QUESTIONNAIRE) {
    const chosen = answers[q.id];
    if (!chosen) continue;
    const opt = q.options.find((o) => o.id === chosen);
    if (!opt) continue;
    for (const [k, v] of Object.entries(opt.scores ?? {})) {
      (prefs as Record<string, number>)[k] = ((prefs as Record<string, number>)[k] ?? 0) + (v as number);
    }
    if ("pace" in opt && opt.pace) pace = opt.pace;
    if ("preferredSessionMinutes" in opt && opt.preferredSessionMinutes)
      preferredSessionMinutes = opt.preferredSessionMinutes;
    if ("focusMinutes" in opt && opt.focusMinutes) focusMinutes = opt.focusMinutes;
    if ("motivationType" in opt && opt.motivationType) motivationType = opt.motivationType;
    if ("priorKnowledge" in opt && opt.priorKnowledge) priorKnowledge = opt.priorKnowledge;
    if ("studyTime" in opt && opt.studyTime) studyTime = opt.studyTime;
  }

  // Score mini-tasks and fold accuracy back into preference weights
  const miniTaskScores: Record<string, { correct: number; total: number }> = {};
  for (const task of MINI_TASKS) {
    const submitted = miniTaskAnswers[task.id];
    if (!submitted) continue;
    let correct = 0;
    for (const a of submitted) {
      const q = task.questions.find((qq) => qq.id === a.questionId);
      if (q && q.correctOptionIndex === a.selectedOptionIndex) correct++;
    }
    miniTaskScores[task.id] = { correct, total: task.questions.length };
    // Boost matching modality weight by accuracy (0..1) * 2
    const boost = (correct / task.questions.length) * 2;
    if (task.id === "read") prefs.textPref += boost;
    else if (task.id === "listen") prefs.audioPref += boost;
    else if (task.id === "visual") prefs.visualPref += boost;
  }

  // Normalise prefs to sum 1
  const sum = prefs.textPref + prefs.audioPref + prefs.visualPref + prefs.practicePref || 1;
  const norm = {
    textPref: prefs.textPref / sum,
    audioPref: prefs.audioPref / sum,
    visualPref: prefs.visualPref / sum,
    practicePref: prefs.practicePref / sum,
  };

  const aiSummary = buildSummary(norm, pace, preferredSessionMinutes, motivationType);

  const values = {
    userId,
    ...norm,
    pace,
    preferredSessionMinutes,
    focusMinutes,
    motivationType,
    priorKnowledge,
    studyTime,
    rawResponses: answers as Record<string, unknown>,
    miniTaskScores,
    aiSummary,
    completedAt: new Date(),
    updatedAt: new Date(),
  };

  await db
    .insert(studyLearningStyleProfilesTable)
    .values(values)
    .onConflictDoUpdate({
      target: studyLearningStyleProfilesTable.userId,
      set: {
        ...norm,
        pace,
        preferredSessionMinutes,
        focusMinutes,
        motivationType,
        priorKnowledge,
        studyTime,
        rawResponses: values.rawResponses,
        miniTaskScores,
        aiSummary,
        updatedAt: sql`now()`,
      },
    });

  const [profile] = await db
    .select()
    .from(studyLearningStyleProfilesTable)
    .where(eq(studyLearningStyleProfilesTable.userId, userId))
    .limit(1);
  res.json(profile);
});

function buildSummary(
  norm: { textPref: number; audioPref: number; visualPref: number; practicePref: number },
  pace: string,
  sessionMinutes: number,
  motivation: string,
): string {
  const ranked = (
    [
      ["reading", norm.textPref],
      ["listening", norm.audioPref],
      ["visual diagrams", norm.visualPref],
      ["hands-on practice", norm.practicePref],
    ] as Array<[string, number]>
  ).sort((a, b) => b[1] - a[1]);
  const top = ranked[0]![0];
  const second = ranked[1]![0];
  const paceLabel = pace === "quick" ? "fast-paced" : pace === "deliberate" ? "deliberate" : "balanced";
  const motivationBit =
    motivation === "deadline"
      ? "with a deadline driving you"
      : motivation === "curiosity"
        ? "driven by curiosity"
        : motivation === "obligation"
          ? "working through required material"
          : "aiming for true mastery";
  return `You learn best through ${top}, supported by ${second}. Your pace is ${paceLabel} and you do well in ~${sessionMinutes}-minute sessions, ${motivationBit}. Your study plan will lean on these strengths.`;
}

export default router;
