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
  questions: jsonb("questions").$type<{
    id: string;
    prompt: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    conceptId: string | null;
    points: number;
  }[]>().notNull().default([]),
  answers: jsonb("answers").$type<{
    questionId: string;
    selectedOptionIndex: number;
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
