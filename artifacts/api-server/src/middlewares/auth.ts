import { type Request, type Response, type NextFunction } from "express";
import {
  db,
  sessionsTable,
  teachersTable,
  studentSessionsTable,
  studentsTable,
  type Teacher,
  type Student,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE, STUDENT_SESSION_COOKIE } from "../lib/auth.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      teacher?: Teacher;
      student?: Student;
    }
  }
}

export async function loadTeacher(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    try {
      const rows = await db
        .select({
          teacher: teachersTable,
          expiresAt: sessionsTable.expiresAt,
        })
        .from(sessionsTable)
        .innerJoin(teachersTable, eq(sessionsTable.teacherId, teachersTable.id))
        .where(eq(sessionsTable.token, token))
        .limit(1);
      const row = rows[0];
      if (row && row.expiresAt > new Date()) {
        req.teacher = row.teacher;
      }
    } catch (err) {
      req.log?.warn({ err }, "session lookup failed");
    }
  }
  const studentToken = req.cookies?.[STUDENT_SESSION_COOKIE];
  if (studentToken) {
    try {
      const rows = await db
        .select({
          student: studentsTable,
          expiresAt: studentSessionsTable.expiresAt,
        })
        .from(studentSessionsTable)
        .innerJoin(studentsTable, eq(studentSessionsTable.studentId, studentsTable.id))
        .where(eq(studentSessionsTable.token, studentToken))
        .limit(1);
      const row = rows[0];
      if (row && row.expiresAt > new Date()) {
        req.student = row.student;
      }
    } catch (err) {
      req.log?.warn({ err }, "student session lookup failed");
    }
  }
  next();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.teacher) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  next();
}

export function requireActiveTeacher(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.teacher) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  if (req.teacher.status === "pending") {
    res.status(403).json({ error: "Your account is awaiting founder approval." });
    return;
  }
  if (req.teacher.status === "suspended") {
    res.status(403).json({ error: "Your account has been suspended. Please contact the founder." });
    return;
  }
  next();
}

export function requireStudent(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.student) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  next();
}
