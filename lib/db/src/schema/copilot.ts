import {
  pgTable,
  text,
  serial,
  timestamp,
  jsonb,
  integer,
  uuid,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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

export const classesTable = pgTable("copilot_classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  subject: text("subject"),
  yearGroup: text("year_group").notNull(),
  region: text("region").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  teacherIdx: index("copilot_classes_teacher_idx").on(t.teacherId),
}));

export const studentsTable = pgTable("copilot_students", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id")
    .notNull()
    .references(() => classesTable.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastInitial: text("last_initial").notNull(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  joinCode: text("join_code").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  classIdx: index("copilot_students_class_idx").on(t.classId),
  teacherIdx: index("copilot_students_teacher_idx").on(t.teacherId),
}));

export const studentSessionsTable = pgTable("copilot_student_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").unique().notNull(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignmentsTable = pgTable("copilot_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersTable.id, { onDelete: "cascade" }),
  classId: uuid("class_id")
    .notNull()
    .references(() => classesTable.id, { onDelete: "cascade" }),
  resourceKind: text("resource_kind").notNull(),
  worksheetId: uuid("worksheet_id").references(() => worksheetsTable.id, { onDelete: "cascade" }),
  quizId: uuid("quiz_id").references(() => quizzesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  deliveryMode: text("delivery_mode").notNull(),
  shareCode: text("share_code").unique().notNull(),
  closed: boolean("closed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  teacherIdx: index("copilot_assignments_teacher_idx").on(t.teacherId),
  classIdx: index("copilot_assignments_class_idx").on(t.classId),
}));

export const submissionsTable = pgTable("copilot_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignmentsTable.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").references(() => studentsTable.id, { onDelete: "set null" }),
  displayName: text("display_name").notNull(),
  answers: jsonb("answers").$type<Record<string, string>>().notNull(),
  autoScore: integer("auto_score").notNull(),
  maxAutoScore: integer("max_auto_score").notNull(),
  needsReviewCount: integer("needs_review_count").notNull().default(0),
  feedback: jsonb("feedback").$type<unknown>(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (t) => ({
  assignIdx: index("copilot_submissions_assignment_idx").on(t.assignmentId),
  studentIdx: index("copilot_submissions_student_idx").on(t.studentId),
  oneSubmissionPerStudent: uniqueIndex("copilot_submissions_unique_per_student")
    .on(t.assignmentId, t.studentId)
    .where(sql`${t.studentId} IS NOT NULL`),
}));

export const pilotRequestsTable = pgTable("copilot_pilot_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  schoolName: text("school_name"),
  country: text("country"),
  gradeLevels: text("grade_levels"),
  organization: text("organization"),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  createdIdx: index("copilot_pilot_requests_created_idx").on(t.createdAt),
}));

export type PilotRequest = typeof pilotRequestsTable.$inferSelect;

export type Teacher = typeof teachersTable.$inferSelect;
export type InsertTeacher = typeof teachersTable.$inferInsert;
export type LessonPlan = typeof lessonPlansTable.$inferSelect;
export type Worksheet = typeof worksheetsTable.$inferSelect;
export type ParentDraft = typeof parentDraftsTable.$inferSelect;
export type Quiz = typeof quizzesTable.$inferSelect;
export type Sample = typeof samplesTable.$inferSelect;
export type ClassRow = typeof classesTable.$inferSelect;
export type Student = typeof studentsTable.$inferSelect;
export type Assignment = typeof assignmentsTable.$inferSelect;
export type Submission = typeof submissionsTable.$inferSelect;
