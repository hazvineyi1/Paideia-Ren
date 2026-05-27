import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  db,
  studyTutorConversationsTable,
  studyTutorMessagesTable,
  studyMaterialsTable,
  studyConceptsTable,
  studyLearnerProfilesTable,
} from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireStudyUser } from "../../middlewares/auth.js";
import { openai, PRIMARY_MODEL } from "../../lib/openai.js";

const router: IRouter = Router();
router.use(requireStudyUser);

const conversationInputSchema = z.object({
  title: z.string().min(1),
  socraticMode: z.boolean().default(false),
  scope: z.enum(["all_material", "specific_material"]).default("all_material"),
  scopeRefId: z.string().nullable().optional(),
});

const messageInputSchema = z.object({
  content: z.string().min(1),
});

async function buildGroundingContext(userId: string): Promise<string> {
  const materials = await db
    .select()
    .from(studyMaterialsTable)
    .where(eq(studyMaterialsTable.userId, userId))
    .orderBy(desc(studyMaterialsTable.createdAt))
    .limit(5);

  const concepts = await db
    .select()
    .from(studyConceptsTable)
    .where(eq(studyConceptsTable.userId, userId))
    .limit(15);

  const profile = await db
    .select()
    .from(studyLearnerProfilesTable)
    .where(eq(studyLearnerProfilesTable.userId, userId))
    .limit(1);

  const parts: string[] = [];

  if (profile.length > 0) {
    const p = profile[0];
    parts.push(`Learner Profile:`);
    if (p.examTarget) parts.push(`- Exam Target: ${p.examTarget}`);
    if (p.goals.length > 0) parts.push(`- Goals: ${p.goals.join(", ")}`);
    if (p.interests.length > 0) parts.push(`- Interests: ${p.interests.join(", ")}`);
    if (p.background) parts.push(`- Background: ${p.background}`);
    parts.push(`- Study Style: ${p.studyStyle}`);
    parts.push(`- Preferred Difficulty: ${p.preferredDifficulty}`);
  }

  if (materials.length > 0) {
    parts.push(`\nStudy Materials:`);
    for (const m of materials) {
      parts.push(`- ${m.title} (${m.sourceType})`);
    }
  }

  if (concepts.length > 0) {
    parts.push(`\nKey Concepts:`);
    for (const c of concepts.slice(0, 10)) {
      parts.push(`- ${c.title}: ${c.explanation.slice(0, 150)}...`);
    }
  }

  return parts.join("\n");
}

router.get("/conversations", async (req, res) => {
  const userId = req.studyUser!.id;
  const rows = await db
    .select()
    .from(studyTutorConversationsTable)
    .where(eq(studyTutorConversationsTable.userId, userId))
    .orderBy(desc(studyTutorConversationsTable.updatedAt));

  const enriched = await Promise.all(
    rows.map(async (c) => {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(studyTutorMessagesTable)
        .where(eq(studyTutorMessagesTable.conversationId, c.id));
      return { ...c, messageCount: Number(count[0]?.count ?? 0) };
    }),
  );

  res.json(enriched);
});

router.post("/conversations", async (req, res) => {
  const parsed = conversationInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const data = parsed.data;
  const userId = req.studyUser!.id;

  const [conv] = await db
    .insert(studyTutorConversationsTable)
    .values({
      userId,
      title: data.title,
      socraticMode: data.socraticMode,
      scope: data.scope,
      scopeRefId: data.scopeRefId ?? null,
    })
    .returning();

  // Send initial AI greeting
  const grounding = await buildGroundingContext(userId);
  const systemPrompt = data.socraticMode
    ? `You are a Socratic tutor. You NEVER give direct answers. Instead, you ask guiding questions that help the learner discover the answer themselves. Be encouraging and patient. Adapt to the learner's background and interests when creating examples.\n\nGrounding context:\n${grounding}`
    : `You are a knowledgeable and adaptive tutor. You explain concepts clearly, use real-world examples that relate to the learner's interests and background, and create immersive scenarios. When appropriate, ask the learner to apply concepts to their own life.\n\nGrounding context:\n${grounding}`;

  try {
    const response = await openai.chat.completions.create({
      model: PRIMARY_MODEL,
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `The learner has started a new conversation: "${data.title}". Please introduce yourself warmly and ask how you can help them today.` },
      ],
    });
    const content = response.choices[0]?.message?.content ?? "Hello! I'm your study tutor. How can I help you today?";
    await db.insert(studyTutorMessagesTable).values({
      conversationId: conv.id,
      role: "assistant",
      content,
      usedPersonalization: true,
    });
  } catch (err) {
    req.log?.warn({ err }, "tutor greeting failed");
    await db.insert(studyTutorMessagesTable).values({
      conversationId: conv.id,
      role: "assistant",
      content: "Hello! I'm your study tutor. How can I help you today?",
    });
  }

  res.status(201).json(conv);
});

router.get("/conversations/:conversationId", async (req, res) => {
  const userId = req.studyUser!.id;
  const conversationId = req.params.conversationId;

  const convs = await db
    .select()
    .from(studyTutorConversationsTable)
    .where(
      and(
        eq(studyTutorConversationsTable.userId, userId),
        eq(studyTutorConversationsTable.id, conversationId),
      ),
    )
    .limit(1);

  if (convs.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const messages = await db
    .select()
    .from(studyTutorMessagesTable)
    .where(eq(studyTutorMessagesTable.conversationId, conversationId))
    .orderBy(studyTutorMessagesTable.createdAt);

  res.json({ conversation: convs[0], messages });
});

router.delete("/conversations/:conversationId", async (req, res) => {
  const userId = req.studyUser!.id;
  const conversationId = req.params.conversationId;
  await db
    .delete(studyTutorConversationsTable)
    .where(
      and(
        eq(studyTutorConversationsTable.userId, userId),
        eq(studyTutorConversationsTable.id, conversationId),
      ),
    );
  res.json({ success: true });
});

router.post("/conversations/:conversationId/messages", async (req, res) => {
  const parsed = messageInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { content } = parsed.data;
  const userId = req.studyUser!.id;
  const conversationId = req.params.conversationId;

  const convs = await db
    .select()
    .from(studyTutorConversationsTable)
    .where(
      and(
        eq(studyTutorConversationsTable.userId, userId),
        eq(studyTutorConversationsTable.id, conversationId),
      ),
    )
    .limit(1);

  if (convs.length === 0) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const conv = convs[0];

  // Store user message
  await db.insert(studyTutorMessagesTable).values({
    conversationId,
    role: "user",
    content,
  });

  // Load conversation history for context
  const history = await db
    .select()
    .from(studyTutorMessagesTable)
    .where(eq(studyTutorMessagesTable.conversationId, conversationId))
    .orderBy(studyTutorMessagesTable.createdAt)
    .limit(20);

  const grounding = await buildGroundingContext(userId);
  const systemPrompt = conv.socraticMode
    ? `You are a Socratic tutor. You NEVER give direct answers. Instead, you ask guiding questions that help the learner discover the answer themselves. Be encouraging and patient. Use the learner's profile and interests to make questions relatable.\n\nGrounding context:\n${grounding}`
    : `You are a knowledgeable and adaptive tutor. Explain concepts clearly, use real-world examples that relate to the learner's interests and background, and create immersive scenarios. When appropriate, ask the learner to apply concepts to their own life. Be inclusive and adjust complexity to the learner's level.\n\nGrounding context:\n${grounding}`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  try {
    const response = await openai.chat.completions.create({
      model: PRIMARY_MODEL,
      max_completion_tokens: 4096,
      messages,
    });
    const aiContent = response.choices[0]?.message?.content ?? "I'm not sure about that. Could you rephrase or ask a different question?";

    const [msg] = await db
      .insert(studyTutorMessagesTable)
      .values({
        conversationId,
        role: "assistant",
        content: aiContent,
        usedPersonalization: true,
      })
      .returning();

    // Update conversation timestamp
    await db
      .update(studyTutorConversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(studyTutorConversationsTable.id, conversationId));

    res.json(msg);
  } catch (err) {
    req.log?.error({ err }, "tutor AI call failed");
    res.status(500).json({ error: "AI tutor temporarily unavailable" });
  }
});

export default router;
