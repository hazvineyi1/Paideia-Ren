import {
  pgTable,
  text,
  serial,
  timestamp,
  jsonb,
  integer,
  uuid,
  index,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const studyUsersTable = pgTable("study_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  subscriptionStatus: text("subscription_status").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studySessionsTable = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").unique().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studyMaterialsTable = pgTable("study_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sourceType: text("source_type").notNull(), // paste, url, file
  sourceUrl: text("source_url"),
  contentText: text("content_text").notNull(),
  strategy: jsonb("strategy").$type<{
    summary: string;
    sessionMinutes: number;
    modalityMix: { text: number; audio: number; visual: number; practice: number };
    activities: Array<{
      order: number;
      title: string;
      description: string;
      modality: "read" | "listen" | "watch" | "practice" | "reflect";
      estimatedMinutes: number;
    }>;
    tips: string[];
    generatedAt: string;
  } | null>().default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_materials_user_idx").on(t.userId),
}));

export const studyConceptsTable = pgTable("study_concepts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => studyMaterialsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  keyTerms: jsonb("key_terms").$type<string[]>().notNull().default([]),
  relatedConceptIds: jsonb("related_concept_ids").$type<string[]>().notNull().default([]),
  visualSvg: text("visual_svg"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_concepts_user_idx").on(t.userId),
  materialIdx: index("study_concepts_material_idx").on(t.materialId),
}));

export const studyFlashcardsTable = pgTable("study_flashcards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  materialId: uuid("material_id").references(() => studyMaterialsTable.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id").references(() => studyConceptsTable.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  hint: text("hint"),
  intervalDays: real("interval_days").notNull().default(1),
  repetitions: integer("repetitions").notNull().default(0),
  easeFactor: real("ease_factor").notNull().default(2.5),
  nextReviewAt: timestamp("next_review_at"),
  lastReviewedAt: timestamp("last_reviewed_at"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_flashcards_user_idx").on(t.userId),
  nextReviewIdx: index("study_flashcards_next_review_idx").on(t.nextReviewAt),
}));

export const studyPracticeSessionsTable = pgTable("study_practice_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  materialId: uuid("material_id").references(() => studyMaterialsTable.id, { onDelete: "set null" }),
  status: text("status").notNull().default("active"),
  questionCount: integer("question_count").notNull(),
  answeredCount: integer("answered_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  questions: jsonb("questions").$type<{
    id: string;
    prompt: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    conceptId: string | null;
    difficulty: string;
  }[]>().notNull().default([]),
  answers: jsonb("answers").$type<{
    questionId: string;
    selectedOptionIndex: number;
    confidence: number;
    correct: boolean;
    answeredAt: string;
  }[]>().notNull().default([]),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_practice_user_idx").on(t.userId),
}));

export const studyMockExamsTable = pgTable("study_mock_exams", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  materialId: uuid("material_id").references(() => studyMaterialsTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  questionCount: integer("question_count").notNull(),
  timeLimitMinutes: integer("time_limit_minutes").notNull(),
  status: text("status").notNull().default("active"),
  format: text("format").notNull().default("multiple-choice"), // multiple-choice | short-answer | essay | fact-pattern | mixed
  questions: jsonb("questions").$type<{
    id: string;
    prompt: string;
    conceptId: string | null;
    points: number;
    format: "multiple-choice" | "short-answer" | "essay" | "fact-pattern";
    // MCQ-only
    options?: string[];
    correctOptionIndex?: number;
    explanation?: string;
    // Free-form
    modelAnswer?: string;
    scoringPoints?: string[];
  }[]>().notNull().default([]),
  answers: jsonb("answers").$type<{
    questionId: string;
    // MCQ
    selectedOptionIndex?: number;
    // Free-form
    freeformAnswer?: string;
    aiScore?: number; // 0..1
    aiFeedback?: string;
    aiCoveredPoints?: string[];
  }[]>().notNull().default([]),
  score: real("score"),
  maxScore: integer("max_score"),
  timeSpentSeconds: integer("time_spent_seconds"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_exams_user_idx").on(t.userId),
}));

export const studyTutorConversationsTable = pgTable("study_tutor_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  socraticMode: boolean("socratic_mode").notNull().default(false),
  scope: text("scope").notNull().default("all_material"),
  scopeRefId: text("scope_ref_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_tutor_conversations_user_idx").on(t.userId),
}));

export const studyTutorMessagesTable = pgTable("study_tutor_messages", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => studyTutorConversationsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  citations: jsonb("citations").$type<Array<{ type: string; title: string; url?: string }>>(),
  usedPersonalization: boolean("used_personalization").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  conversationIdx: index("study_tutor_messages_conversation_idx").on(t.conversationId),
}));

export const studyLearnerProfilesTable = pgTable("study_learner_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  goals: jsonb("goals").$type<string[]>().notNull().default([]),
  examTarget: text("exam_target"),
  studyStyle: text("study_style").notNull().default("balanced"),
  preferredSessionLength: integer("preferred_session_length").notNull().default(25),
  preferredDifficulty: text("preferred_difficulty").notNull().default("mixed"),
  weakAreas: jsonb("weak_areas").$type<string[]>().notNull().default([]),
  strongAreas: jsonb("strong_areas").$type<string[]>().notNull().default([]),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),
  background: text("background"),
  dailyStudyMinutes: integer("daily_study_minutes").notNull().default(30),
  timezone: text("timezone"),
  // Diagnostic intake fields (from "The Method" v2 onboarding)
  examDate: timestamp("exam_date"),
  hoursPerWeek: integer("hours_per_week"),
  baselineLevel: text("baseline_level"), // zero | foundations | solid | rusty
  calibrationSelfRating: text("calibration_self_rating"), // high | mid | low | under
  failureMode: text("failure_mode"), // passive | cram | avoid | scattered | perfect
  // The Coach: chosen personality voice (drill | socratic | warm | analyst).
  // Voice/pressure only — never changes accuracy or pedagogy.
  coachPersonality: text("coach_personality"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studyWeeklyBriefsTable = pgTable("study_weekly_briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  flashcardsReviewed: integer("flashcards_reviewed").notNull().default(0),
  practiceSessionsCompleted: integer("practice_sessions_completed").notNull().default(0),
  mockExamsTaken: integer("mock_exams_taken").notNull().default(0),
  averageAccuracy: real("average_accuracy").notNull().default(0),
  tutorConversations: integer("tutor_conversations").notNull().default(0),
  newConceptsMastered: integer("new_concepts_mastered").notNull().default(0),
  weakAreas: jsonb("weak_areas").$type<string[]>().notNull().default([]),
  recommendations: jsonb("recommendations").$type<string[]>().notNull().default([]),
  aiSummary: text("ai_summary"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_weekly_briefs_user_idx").on(t.userId),
}));

// ─── Knowledge Graph ───
export const studyKnowledgeNodesTable = pgTable("study_knowledge_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  description: text("description"),
  category: text("category"), // e.g. "mathematics", "biology", "history"
  masteryLevel: real("mastery_level").notNull().default(0), // 0-1
  confidenceScore: real("confidence_score").notNull().default(0), // 0-1
  reviewCount: integer("review_count").notNull().default(0),
  lastAssessedAt: timestamp("last_assessed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_knowledge_nodes_user_idx").on(t.userId),
  labelIdx: index("study_knowledge_nodes_label_idx").on(t.label),
}));

export const studyKnowledgeEdgesTable = pgTable("study_knowledge_edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  sourceNodeId: uuid("source_node_id")
    .notNull()
    .references(() => studyKnowledgeNodesTable.id, { onDelete: "cascade" }),
  targetNodeId: uuid("target_node_id")
    .notNull()
    .references(() => studyKnowledgeNodesTable.id, { onDelete: "cascade" }),
  relationType: text("relation_type").notNull().default("related"), // prerequisite, related, subtopic, extension
  strength: real("strength").notNull().default(0.5), // 0-1
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_knowledge_edges_user_idx").on(t.userId),
  sourceIdx: index("study_knowledge_edges_source_idx").on(t.sourceNodeId),
  targetIdx: index("study_knowledge_edges_target_idx").on(t.targetNodeId),
}));

// ─── Content Chunks (for large documents) ───
export const studyContentChunksTable = pgTable("study_content_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => studyMaterialsTable.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  embedding: jsonb("embedding").$type<number[]>(), // vector for semantic search
  nodeIds: jsonb("node_ids").$type<string[]>().notNull().default([]), // linked knowledge nodes
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_content_chunks_user_idx").on(t.userId),
  materialIdx: index("study_content_chunks_material_idx").on(t.materialId),
}));

// ─── Annotations (user highlights, notes on content) ───
export const studyAnnotationsTable = pgTable("study_annotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => studyMaterialsTable.id, { onDelete: "cascade" }),
  chunkId: uuid("chunk_id").references(() => studyContentChunksTable.id, { onDelete: "cascade" }),
  selectionText: text("selection_text"),
  startOffset: integer("start_offset"),
  endOffset: integer("end_offset"),
  note: text("note"),
  color: text("color").default("yellow"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_annotations_user_idx").on(t.userId),
  materialIdx: index("study_annotations_material_idx").on(t.materialId),
}));

// ─── Content Sources (multi-modal ingestion tracking) ───
export const studyContentSourcesTable = pgTable("study_content_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => studyMaterialsTable.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(), // pdf, image, url, audio, video, paste
  originalFilename: text("original_filename"),
  originalUrl: text("original_url"),
  mimeType: text("mime_type"),
  fileSizeBytes: integer("file_size_bytes"),
  extractedText: text("extracted_text"),
  processingStatus: text("processing_status").notNull().default("pending"), // pending, processing, completed, failed
  processingError: text("processing_error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_content_sources_user_idx").on(t.userId),
  materialIdx: index("study_content_sources_material_idx").on(t.materialId),
}));

// ─── Learning Paths (adaptive sequence of what to study) ───
export const studyLearningPathsTable = pgTable("study_learning_paths", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  goal: text("goal"),
  status: text("status").notNull().default("active"), // active, completed, paused
  nodeSequence: jsonb("node_sequence").$type<Array<{
    nodeId: string;
    order: number;
    estimatedMinutes: number;
    status: "pending" | "in_progress" | "completed";
  }>>().notNull().default([]),
  totalEstimatedMinutes: integer("total_estimated_minutes").notNull().default(0),
  completedMinutes: integer("completed_minutes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_learning_paths_user_idx").on(t.userId),
}));

// ─── Learner Cognitive Profiles (deep personalization) ───
export const studyCognitiveProfilesTable = pgTable("study_cognitive_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  // NOTE: VARK-style (visual/auditory/reading/kinesthetic) columns previously lived here.
  // They have been removed because VARK is not supported by evidence. The evidence-based
  // cognitive profile (processingStyle, pace, strengthByQuestionType, confidencePattern,
  // inferenceConfidence) is computed by assessment.ts and stored on the assessment record
  // and learning path, not on this table. The physical columns may remain in older
  // databases; Drizzle will ignore them and they will be dropped in a future migration.
  // Pace
  optimalSessionMinutes: integer("optimal_session_minutes").notNull().default(25),
  breakFrequencyMinutes: integer("break_frequency_minutes").notNull().default(5),
  preferredStudyTimeOfDay: text("preferred_study_time_of_day").default("morning"), // morning, afternoon, evening, night
  // Attention & engagement
  averageAttentionSpanMinutes: real("average_attention_span_minutes").notNull().default(20),
  engagementPattern: text("engagement_pattern").default("steady"), // steady, burst, variable
  // Performance patterns
  accuracyTrend: text("accuracy_trend").default("stable"), // improving, declining, stable, volatile
  difficultyCalibration: real("difficulty_calibration").notNull().default(0.5), // -1 to 1 (needs easier to needs harder)
  responseTimePattern: text("response_time_pattern").default("average"), // fast, average, deliberate
  // Adaptive state
  currentEnergyLevel: real("current_energy_level").notNull().default(0.7), // 0-1
  currentMood: text("current_mood").default("neutral"), // focused, tired, energized, stressed, neutral
  lastAssessedAt: timestamp("last_assessed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Learning Style Profiles (how-the-learner-learns diagnostic, run BEFORE material) ───
export const studyLearningStyleProfilesTable = pgTable("study_learning_style_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  // Modality preference weights (0-1, should sum ~ 1)
  textPref: real("text_pref").notNull().default(0.25),
  audioPref: real("audio_pref").notNull().default(0.25),
  visualPref: real("visual_pref").notNull().default(0.25),
  practicePref: real("practice_pref").notNull().default(0.25),
  // Pace / structure
  pace: text("pace").notNull().default("moderate"), // deliberate | moderate | quick
  preferredSessionMinutes: integer("preferred_session_minutes").notNull().default(25),
  focusMinutes: integer("focus_minutes").notNull().default(20),
  motivationType: text("motivation_type").notNull().default("mastery"), // mastery | deadline | curiosity | obligation
  priorKnowledge: text("prior_knowledge").notNull().default("some"), // none | some | strong
  studyTime: text("study_time").notNull().default("flexible"), // morning | afternoon | evening | night | flexible
  // Raw responses + mini-task scores for transparency
  rawResponses: jsonb("raw_responses").$type<Record<string, unknown>>().notNull().default({}),
  miniTaskScores: jsonb("mini_task_scores").$type<{
    read?: { correct: number; total: number };
    listen?: { correct: number; total: number };
    visual?: { correct: number; total: number };
  }>().notNull().default({}),
  aiSummary: text("ai_summary"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Assessments (diagnostic quiz after material ingestion) ───
export const studyAssessmentsTable = pgTable("study_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => studyMaterialsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, completed
  questions: jsonb("questions").$type<Array<{
    id: string;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    conceptId: string;
    difficulty: "easy" | "medium" | "hard";
    type: "recall" | "comprehension" | "application";
  }>>().notNull().default([]),
  conceptIds: jsonb("concept_ids").$type<string[]>().notNull().default([]),
  results: jsonb("results").$type<{
    answers: Array<{
      questionId: string;
      selectedOptionIndex: number;
      correct: boolean;
      timeSpentSeconds: number;
    }>;
    score: number; // 0-100
    accuracyByConcept: Record<string, number>;
    detectedDifficulty: "beginner" | "intermediate" | "advanced";
    recommendedPathType: "gentle" | "standard" | "intensive";
  } | null>().default(null),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_assessments_user_idx").on(t.userId),
  materialIdx: index("study_assessments_material_idx").on(t.materialId),
}));

// ─── Learning Path Steps (structured steps for guided learning) ───
export const studyLearningPathStepsTable = pgTable("study_learning_path_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  pathId: uuid("path_id")
    .notNull()
    .references(() => studyLearningPathsTable.id, { onDelete: "cascade" }),
  nodeId: uuid("node_id")
    .references(() => studyKnowledgeNodesTable.id, { onDelete: "set null" }),
  conceptId: uuid("concept_id")
    .references(() => studyConceptsTable.id, { onDelete: "set null" }),
  order: integer("order").notNull(),
  stepType: text("step_type").notNull(), // read_material, flashcard_review, practice_questions, tutor_session, mastery_check, spaced_review
  title: text("title").notNull(),
  description: text("description"),
  estimatedMinutes: integer("estimated_minutes").notNull().default(10),
  status: text("status").notNull().default("locked"), // locked, available, in_progress, completed, skipped
  contentRef: text("content_ref"), // materialId, conceptId, etc
  prerequisites: jsonb("prerequisites").$type<string[]>().notNull().default([]),
  completedAt: timestamp("completed_at"),
  masteryScore: real("mastery_score"), // 0-1, set after completion
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_path_steps_user_idx").on(t.userId),
  pathIdx: index("study_path_steps_path_idx").on(t.pathId),
  statusIdx: index("study_path_steps_status_idx").on(t.status),
}));

// ─── Activity Log (for pattern detection) ───
export const studyActivityLogTable = pgTable("study_activity_log", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => studyUsersTable.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(), // flashcard_review, practice_question, exam_question, tutor_chat, material_read, annotation
  entityId: text("entity_id"), // id of related entity
  entityType: text("entity_type"), // flashcard, session, exam, etc
  durationSeconds: integer("duration_seconds"),
  accuracy: real("accuracy"), // 0-1 if applicable
  confidence: real("confidence"), // 0-1 if applicable
  difficulty: text("difficulty"),
  conceptIds: jsonb("concept_ids").$type<string[]>().notNull().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("study_activity_log_user_idx").on(t.userId),
  typeIdx: index("study_activity_log_type_idx").on(t.activityType),
  createdIdx: index("study_activity_log_created_idx").on(t.createdAt),
}));

export type StudyUser = typeof studyUsersTable.$inferSelect;
export type InsertStudyUser = typeof studyUsersTable.$inferInsert;
export type StudySession = typeof studySessionsTable.$inferSelect;
export type StudyMaterial = typeof studyMaterialsTable.$inferSelect;
export type StudyConcept = typeof studyConceptsTable.$inferSelect;
export type StudyFlashcard = typeof studyFlashcardsTable.$inferSelect;
export type StudyPracticeSession = typeof studyPracticeSessionsTable.$inferSelect;
export type StudyMockExam = typeof studyMockExamsTable.$inferSelect;
export type StudyTutorConversation = typeof studyTutorConversationsTable.$inferSelect;
export type StudyTutorMessage = typeof studyTutorMessagesTable.$inferSelect;
export type StudyLearnerProfile = typeof studyLearnerProfilesTable.$inferSelect;
export type StudyWeeklyBrief = typeof studyWeeklyBriefsTable.$inferSelect;
export type StudyKnowledgeNode = typeof studyKnowledgeNodesTable.$inferSelect;
export type StudyKnowledgeEdge = typeof studyKnowledgeEdgesTable.$inferSelect;
export type StudyContentChunk = typeof studyContentChunksTable.$inferSelect;
export type StudyAnnotation = typeof studyAnnotationsTable.$inferSelect;
export type StudyContentSource = typeof studyContentSourcesTable.$inferSelect;
export type StudyLearningPath = typeof studyLearningPathsTable.$inferSelect;
export type StudyLearningPathStep = typeof studyLearningPathStepsTable.$inferSelect;
export type StudyAssessment = typeof studyAssessmentsTable.$inferSelect;
export type StudyCognitiveProfile = typeof studyCognitiveProfilesTable.$inferSelect;
export type StudyActivityLog = typeof studyActivityLogTable.$inferSelect;
export type StudyLearningStyleProfile = typeof studyLearningStyleProfilesTable.$inferSelect;
export type InsertStudyLearningStyleProfile = typeof studyLearningStyleProfilesTable.$inferInsert;
