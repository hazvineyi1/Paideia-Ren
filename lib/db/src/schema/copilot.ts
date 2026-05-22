import {
  pgTable,
  text,
  serial,
  timestamp,
  jsonb,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

export const teachersTable = pgTable("copilot_teachers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  country: text("country"),
  schoolName: text("school_name"),
  subjects: jsonb("subjects").$type<string[]>().notNull().default([]),
  yearGroups: jsonb("year_groups").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionsTable = pgTable("copilot_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").unique().notNull(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessonPlansTable = pgTable("copilot_lesson_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  region: text("region").notNull(),
  subject: text("subject").notNull(),
  yearGroup: text("year_group").notNull(),
  topic: text("topic").notNull(),
  priorKnowledge: text("prior_knowledge"),
  durationMinutes: integer("duration_minutes").default(50).notNull(),
  groupContext: text("group_context"),
  content: jsonb("content").$type<unknown>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const worksheetsTable = pgTable("copilot_worksheets", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  region: text("region").notNull(),
  subject: text("subject").notNull(),
  yearGroup: text("year_group").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
  questionCount: integer("question_count").notNull(),
  content: jsonb("content").$type<unknown>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentDraftsTable = pgTable("copilot_parent_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  region: text("region").notNull(),
  yearGroup: text("year_group"),
  tone: text("tone").notNull(),
  keyPoints: text("key_points").notNull(),
  content: jsonb("content").$type<unknown>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzesTable = pgTable("copilot_quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  region: text("region").notNull(),
  subject: text("subject").notNull(),
  yearGroup: text("year_group").notNull(),
  topic: text("topic").notNull(),
  format: text("format").notNull(),
  questionCount: integer("question_count").notNull(),
  content: jsonb("content").$type<unknown>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const samplesTable = pgTable("copilot_samples", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  region: text("region").notNull(),
  subject: text("subject").notNull(),
  yearGroup: text("year_group").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: jsonb("content").$type<unknown>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Teacher = typeof teachersTable.$inferSelect;
export type InsertTeacher = typeof teachersTable.$inferInsert;
export type LessonPlan = typeof lessonPlansTable.$inferSelect;
export type Worksheet = typeof worksheetsTable.$inferSelect;
export type ParentDraft = typeof parentDraftsTable.$inferSelect;
export type Quiz = typeof quizzesTable.$inferSelect;
export type Sample = typeof samplesTable.$inferSelect;
