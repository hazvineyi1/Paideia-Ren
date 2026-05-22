import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  db,
  classesTable,
  studentsTable,
  assignmentsTable,
  submissionsTable,
} from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth.js";
import { REGION_IDS } from "../../lib/catalog.js";
import { generateShortCode, hashPassword } from "../../lib/auth.js";

const router: IRouter = Router();
router.use(requireAuth);

const createClassSchema = z.object({
  name: z.string().min(1).max(120),
  yearGroup: z.string().min(1).max(40),
  subject: z.string().max(120).optional(),
  region: z.string().refine((v) => REGION_IDS.includes(v)),
});

router.post("/", async (req, res) => {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [row] = await db
    .insert(classesTable)
    .values({
      teacherId: req.teacher!.id,
      name: parsed.data.name,
      yearGroup: parsed.data.yearGroup,
      subject: parsed.data.subject ?? null,
      region: parsed.data.region,
    })
    .returning();
  res.json({ class: row });
});

router.get("/", async (req, res) => {
  const classes = await db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      subject: classesTable.subject,
      yearGroup: classesTable.yearGroup,
      region: classesTable.region,
      createdAt: classesTable.createdAt,
      studentCount: sql<number>`count(${studentsTable.id})::int`,
    })
    .from(classesTable)
    .leftJoin(studentsTable, eq(studentsTable.classId, classesTable.id))
    .where(eq(classesTable.teacherId, req.teacher!.id))
    .groupBy(classesTable.id)
    .orderBy(desc(classesTable.createdAt));
  res.json({ classes });
});

router.get("/:id", async (req, res) => {
  const id = req.params["id"] as string;
  const rows = await db
    .select()
    .from(classesTable)
    .where(and(eq(classesTable.id, id), eq(classesTable.teacherId, req.teacher!.id)))
    .limit(1);
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.classId, id))
    .orderBy(studentsTable.firstName);
  const assignments = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.classId, id))
    .orderBy(desc(assignmentsTable.createdAt));
  const studentsSanitised = students.map(({ passwordHash: _ph, ...rest }) => rest);
  res.json({ class: rows[0], students: studentsSanitised, assignments });
});

router.delete("/:id", async (req, res) => {
  const id = req.params["id"] as string;
  await db
    .delete(classesTable)
    .where(and(eq(classesTable.id, id), eq(classesTable.teacherId, req.teacher!.id)));
  res.json({ ok: true });
});

const addStudentSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastInitial: z.string().min(1).max(8),
  email: z.string().email().max(200).optional().or(z.literal("")),
  password: z.string().min(6).max(200).optional().or(z.literal("")),
});

router.post("/:id/students", async (req, res) => {
  const id = req.params["id"] as string;
  const cls = await db
    .select()
    .from(classesTable)
    .where(and(eq(classesTable.id, id), eq(classesTable.teacherId, req.teacher!.id)))
    .limit(1);
  if (!cls[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const parsed = addStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const email = parsed.data.email?.trim().toLowerCase() || null;
  const password = parsed.data.password?.trim() || null;
  if (email && !password) {
    res.status(400).json({ error: "Password required when email is set" });
    return;
  }
  if (email) {
    const existing = await db
      .select({ id: studentsTable.id })
      .from(studentsTable)
      .where(eq(studentsTable.email, email))
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "A student with that email already exists" });
      return;
    }
  }
  const joinCode = generateShortCode(6);
  const [row] = await db
    .insert(studentsTable)
    .values({
      classId: id,
      teacherId: req.teacher!.id,
      firstName: parsed.data.firstName.trim(),
      lastInitial: parsed.data.lastInitial.trim().slice(0, 4).toUpperCase(),
      email,
      passwordHash: password ? hashPassword(password) : null,
      joinCode,
    })
    .returning();
  const { passwordHash: _ph, ...rest } = row;
  res.json({ student: rest });
});

router.delete("/:id/students/:studentId", async (req, res) => {
  const { id, studentId } = req.params as { id: string; studentId: string };
  const cls = await db
    .select({ id: classesTable.id })
    .from(classesTable)
    .where(and(eq(classesTable.id, id), eq(classesTable.teacherId, req.teacher!.id)))
    .limit(1);
  if (!cls[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(studentsTable).where(and(eq(studentsTable.id, studentId), eq(studentsTable.classId, id)));
  res.json({ ok: true });
});

router.get("/:id/students/:studentId/profile", async (req, res) => {
  const { id, studentId } = req.params as { id: string; studentId: string };
  const studentRows = await db
    .select()
    .from(studentsTable)
    .where(and(eq(studentsTable.id, studentId), eq(studentsTable.classId, id), eq(studentsTable.teacherId, req.teacher!.id)))
    .limit(1);
  const student = studentRows[0];
  if (!student) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const subs = await db
    .select({
      submission: submissionsTable,
      assignment: assignmentsTable,
    })
    .from(submissionsTable)
    .innerJoin(assignmentsTable, eq(submissionsTable.assignmentId, assignmentsTable.id))
    .where(eq(submissionsTable.studentId, studentId))
    .orderBy(desc(submissionsTable.submittedAt));
  const { passwordHash: _ph, ...studentSafe } = student;
  res.json({ student: studentSafe, submissions: subs });
});

export default router;
