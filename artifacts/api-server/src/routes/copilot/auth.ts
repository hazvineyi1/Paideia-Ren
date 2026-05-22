import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, teachersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  newSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_DAYS,
  sessionExpiry,
  verifyPassword,
} from "../../lib/auth.js";
import { REGION_IDS } from "../../lib/catalog.js";
import { requireAuth } from "../../middlewares/auth.js";

const router: IRouter = Router();

const signupSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(120),
  region: z.string().refine((v) => REGION_IDS.includes(v), {
    message: "Unknown region",
  }),
  country: z.string().max(120).optional(),
  schoolName: z.string().max(200).optional(),
  subjects: z.array(z.string().max(120)).max(20).default([]),
  yearGroups: z.array(z.string().max(40)).max(20).default([]),
});

const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env["NODE_ENV"] === "production",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;
  const emailLower = data.email.trim().toLowerCase();

  const existing = await db
    .select({ id: teachersTable.id })
    .from(teachersTable)
    .where(eq(teachersTable.email, emailLower))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }

  const [teacher] = await db
    .insert(teachersTable)
    .values({
      email: emailLower,
      passwordHash: hashPassword(data.password),
      name: data.name.trim(),
      region: data.region,
      country: data.country?.trim() || null,
      schoolName: data.schoolName?.trim() || null,
      subjects: data.subjects,
      yearGroups: data.yearGroups,
    })
    .returning();

  const token = newSessionToken();
  await db.insert(sessionsTable).values({
    token,
    teacherId: teacher.id,
    expiresAt: sessionExpiry(),
  });

  res.cookie(SESSION_COOKIE, token, cookieOptions());
  res.json({ teacher: serialiseTeacher(teacher) });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const emailLower = parsed.data.email.trim().toLowerCase();
  const rows = await db
    .select()
    .from(teachersTable)
    .where(eq(teachersTable.email, emailLower))
    .limit(1);
  const teacher = rows[0];
  if (!teacher || !verifyPassword(parsed.data.password, teacher.passwordHash)) {
    res.status(401).json({ error: "Email or password is incorrect" });
    return;
  }
  const token = newSessionToken();
  await db.insert(sessionsTable).values({
    token,
    teacherId: teacher.id,
    expiresAt: sessionExpiry(),
  });
  res.cookie(SESSION_COOKIE, token, cookieOptions());
  res.json({ teacher: serialiseTeacher(teacher) });
});

router.post("/logout", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  if (!req.teacher) {
    res.json({ teacher: null });
    return;
  }
  res.json({ teacher: serialiseTeacher(req.teacher) });
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  region: z
    .string()
    .refine((v) => REGION_IDS.includes(v), { message: "Unknown region" })
    .optional(),
  country: z.string().max(120).nullable().optional(),
  schoolName: z.string().max(200).nullable().optional(),
  subjects: z.array(z.string().max(120)).max(20).optional(),
  yearGroups: z.array(z.string().max(40)).max(20).optional(),
});

router.patch("/me", requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [updated] = await db
    .update(teachersTable)
    .set(parsed.data)
    .where(eq(teachersTable.id, req.teacher!.id))
    .returning();
  res.json({ teacher: serialiseTeacher(updated) });
});

function serialiseTeacher(t: typeof teachersTable.$inferSelect) {
  const { passwordHash: _ignored, ...rest } = t;
  return rest;
}

export default router;
