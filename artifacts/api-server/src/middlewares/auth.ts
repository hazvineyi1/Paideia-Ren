import { type Request, type Response, type NextFunction } from "express";
import { db, sessionsTable, teachersTable, type Teacher } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE } from "../lib/auth.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      teacher?: Teacher;
    }
  }
}

export async function loadTeacher(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    next();
    return;
  }
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
