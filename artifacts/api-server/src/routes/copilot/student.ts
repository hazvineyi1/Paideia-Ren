import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  db,
  studentsTable,
  studentSessionsTable,
  assignmentsTable,
  classesTable,
  worksheetsTable,
  quizzesTable,
  submissionsTable,
} from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import {
  newSessionToken,
  STUDENT_SESSION_COOKIE,
  SESSION_TTL_DAYS,
  sessionExpiry,
  verifyPassword,
} from "../../lib/auth.js";
import { requireStudent } from "../../middlewares/auth.js";
import { gradeQuiz, gradeWorksheet } from "../../lib/grading.js";

const router: IRouter = Router();

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env["NODE_ENV"] === "production",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

const loginSchema = z.object({
  identifier: z.string().min(1).max(200),
  password: z.string().min(1).max(200),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const id = parsed.data.identifier.trim();
  const idLower = id.toLowerCase();
  const idUpper = id.toUpperCase();
  const byEmail = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.email, idLower))
    .limit(1);
  let student = byEmail[0];
  if (!student) {
    const byCode = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.joinCode, idUpper))
      .limit(1);
    student = byCode[0];
  }
  if (!student || !student.passwordHash || !verifyPassword(parsed.data.password, student.passwordHash)) {
    res.status(401).json({ error: "Login details are incorrect" });
    return;
  }
  const token = newSessionToken();
  await db.insert(studentSessionsTable).values({
    token,
    studentId: student.id,
    expiresAt: sessionExpiry(),
  });
  res.cookie(STUDENT_SESSION_COOKIE, token, cookieOptions());
  const { passwordHash: _ph, ...safe } = student;
  res.json({ student: safe });
});

router.post("/logout", async (req, res) => {
  const token = req.cookies?.[STUDENT_SESSION_COOKIE];
  if (token) {
    await db.delete(studentSessionsTable).where(eq(studentSessionsTable.token, token));
  }
  res.clearCookie(STUDENT_SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  if (!req.student) {
    res.json({ student: null });
    return;
  }
  const { passwordHash: _ph, ...safe } = req.student;
  res.json({ student: safe });
});

router.get("/assignments", requireStudent, async (req, res) => {
  const rows = await db
    .select({
      assignment: assignmentsTable,
      class: classesTable,
    })
    .from(assignmentsTable)
    .innerJoin(classesTable, eq(assignmentsTable.classId, classesTable.id))
    .where(and(eq(assignmentsTable.classId, req.student!.classId), eq(assignmentsTable.deliveryMode, "accounts")))
    .orderBy(desc(assignmentsTable.createdAt));
  const mine = await db
    .select({ assignmentId: submissionsTable.assignmentId })
    .from(submissionsTable)
    .where(eq(submissionsTable.studentId, req.student!.id));
  const submitted = new Set(mine.map((m) => m.assignmentId));
  res.json({
    assignments: rows.map((r) => ({ ...r.assignment, className: r.class.name, submitted: submitted.has(r.assignment.id) })),
  });
});

router.get("/assignments/:id", requireStudent, async (req, res) => {
  const id = req.params["id"] as string;
  const rows = await db
    .select()
    .from(assignmentsTable)
    .where(and(eq(assignmentsTable.id, id), eq(assignmentsTable.classId, req.student!.classId), eq(assignmentsTable.deliveryMode, "accounts")))
    .limit(1);
  const assignment = rows[0];
  if (!assignment) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const existing = await db
    .select()
    .from(submissionsTable)
    .where(and(eq(submissionsTable.assignmentId, id), eq(submissionsTable.studentId, req.student!.id)))
    .orderBy(desc(submissionsTable.submittedAt))
    .limit(1);
  const resource = await loadResource(assignment);
  if (!resource) {
    res.status(500).json({ error: "Resource missing" });
    return;
  }
  res.json({
    assignment: { id: assignment.id, title: assignment.title, resourceKind: assignment.resourceKind, closed: assignment.closed },
    resource: stripAnswers(resource, assignment.resourceKind),
    submission: existing[0] ?? null,
  });
});

router.post("/assignments/:id/submit", requireStudent, async (req, res) => {
  const id = req.params["id"] as string;
  const schema = z.object({ answers: z.record(z.string(), z.string().max(4000)) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const rows = await db
    .select()
    .from(assignmentsTable)
    .where(and(eq(assignmentsTable.id, id), eq(assignmentsTable.classId, req.student!.classId), eq(assignmentsTable.deliveryMode, "accounts")))
    .limit(1);
  const assignment = rows[0];
  if (!assignment || assignment.closed) {
    res.status(403).json({ error: "Assignment is not open" });
    return;
  }
  const existing = await db
    .select({ id: submissionsTable.id })
    .from(submissionsTable)
    .where(and(eq(submissionsTable.assignmentId, id), eq(submissionsTable.studentId, req.student!.id)))
    .limit(1);
  if (existing[0]) {
    res.status(409).json({ error: "You have already submitted this assignment." });
    return;
  }
  const resource = await loadResource(assignment);
  if (!resource) {
    res.status(500).json({ error: "Resource missing" });
    return;
  }
  const graded = gradeResource(resource, assignment.resourceKind, parsed.data.answers);
  const displayName = `${req.student!.firstName} ${req.student!.lastInitial}`;
  let submission;
  try {
    [submission] = await db
      .insert(submissionsTable)
      .values({
        assignmentId: id,
        studentId: req.student!.id,
        displayName,
        answers: parsed.data.answers,
        autoScore: graded.autoScore,
        maxAutoScore: graded.maxAutoScore,
        needsReviewCount: graded.needsReviewCount,
        feedback: graded.feedback,
      })
      .returning();
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      res.status(409).json({ error: "You have already submitted this assignment." });
      return;
    }
    throw err;
  }
  if (!submission) {
    res.status(500).json({ error: "Could not save submission" });
    return;
  }
  res.json({
    submission: {
      id: submission.id,
      autoScore: submission.autoScore,
      maxAutoScore: submission.maxAutoScore,
      needsReviewCount: submission.needsReviewCount,
      feedback: graded.feedback,
    },
  });
});

async function loadResource(a: { resourceKind: string; worksheetId: string | null; quizId: string | null }) {
  if (a.resourceKind === "worksheet" && a.worksheetId) {
    const r = await db.select().from(worksheetsTable).where(eq(worksheetsTable.id, a.worksheetId)).limit(1);
    return r[0] ?? null;
  }
  if (a.resourceKind === "quiz" && a.quizId) {
    const r = await db.select().from(quizzesTable).where(eq(quizzesTable.id, a.quizId)).limit(1);
    return r[0] ?? null;
  }
  return null;
}

function stripAnswers(resource: { content: unknown }, kind: string) {
  const c = JSON.parse(JSON.stringify(resource.content)) as Record<string, unknown>;
  if (kind === "worksheet" && Array.isArray(c["questions"])) {
    c["questions"] = (c["questions"] as Array<Record<string, unknown>>).map((q) => {
      const { answer: _a, workingOrRubric: _w, ...rest } = q;
      return rest;
    });
  }
  if (kind === "quiz" && Array.isArray(c["items"])) {
    c["items"] = (c["items"] as Array<Record<string, unknown>>).map((q) => {
      const { correctAnswer: _a, ...rest } = q;
      return rest;
    });
  }
  return c;
}

function gradeResource(resource: { content: unknown }, kind: string, answers: Record<string, string>) {
  const c = resource.content as Record<string, unknown>;
  if (kind === "quiz") {
    return gradeQuiz((c["items"] as never) ?? [], answers);
  }
  return gradeWorksheet((c["questions"] as never) ?? [], answers);
}

export default router;
