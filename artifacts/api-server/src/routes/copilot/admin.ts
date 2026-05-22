import { Router, type IRouter, type RequestHandler } from "express";
import { db, teachersTable, classesTable, studentsTable, lessonPlansTable, worksheetsTable, quizzesTable, parentDraftsTable, assignmentsTable, submissionsTable, pilotRequestsTable } from "@workspace/db";
import { sql, desc, gte } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth.js";

const router: IRouter = Router();

function adminEmails(): Set<string> {
  return new Set(
    (process.env["ADMIN_EMAILS"] ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.teacher) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  if (!adminEmails().has(req.teacher.email.toLowerCase())) {
    res.status(403).json({ error: "Admin access only" });
    return;
  }
  next();
};

router.use(requireAuth, requireAdmin);

router.get("/stats", async (_req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    teachers,
    classes,
    students,
    lessonPlans,
    worksheets,
    quizzes,
    parentDrafts,
    assignments,
    submissions,
    pilotRequestsCount,
    activeTeachersRows,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(teachersTable),
    db.select({ c: sql<number>`count(*)::int` }).from(classesTable),
    db.select({ c: sql<number>`count(*)::int` }).from(studentsTable),
    db.select({ c: sql<number>`count(*)::int` }).from(lessonPlansTable),
    db.select({ c: sql<number>`count(*)::int` }).from(worksheetsTable),
    db.select({ c: sql<number>`count(*)::int` }).from(quizzesTable),
    db.select({ c: sql<number>`count(*)::int` }).from(parentDraftsTable),
    db.select({ c: sql<number>`count(*)::int` }).from(assignmentsTable),
    db.select({ c: sql<number>`count(*)::int` }).from(submissionsTable),
    db.select({ c: sql<number>`count(*)::int` }).from(pilotRequestsTable),
    db.execute(sql`
      SELECT COUNT(DISTINCT teacher_id)::int AS c FROM (
        SELECT teacher_id FROM copilot_lesson_plans WHERE created_at >= ${weekAgo}
        UNION ALL
        SELECT teacher_id FROM copilot_worksheets WHERE created_at >= ${weekAgo}
        UNION ALL
        SELECT teacher_id FROM copilot_quizzes WHERE created_at >= ${weekAgo}
        UNION ALL
        SELECT teacher_id FROM copilot_parent_drafts WHERE created_at >= ${weekAgo}
        UNION ALL
        SELECT teacher_id FROM copilot_assignments WHERE created_at >= ${weekAgo}
      ) AS activity
    `),
  ]);

  const activeTeachersThisWeek = Number(
    (activeTeachersRows.rows?.[0] as { c?: number } | undefined)?.c ?? 0,
  );

  const recentSignups = await db
    .select({
      id: teachersTable.id,
      name: teachersTable.name,
      email: teachersTable.email,
      schoolName: teachersTable.schoolName,
      country: teachersTable.country,
      region: teachersTable.region,
      createdAt: teachersTable.createdAt,
    })
    .from(teachersTable)
    .orderBy(desc(teachersTable.createdAt))
    .limit(10);

  const recentPilotRequests = await db
    .select()
    .from(pilotRequestsTable)
    .orderBy(desc(pilotRequestsTable.createdAt))
    .limit(20);

  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const weekly = await db.execute(sql`
    WITH weeks AS (
      SELECT generate_series(
        date_trunc('week', ${fourWeeksAgo}::timestamp),
        date_trunc('week', now()),
        interval '1 week'
      ) AS week_start
    )
    SELECT
      w.week_start,
      COALESCE(t.c, 0)::int AS teachers,
      COALESCE(r.c, 0)::int AS resources,
      COALESCE(s.c, 0)::int AS submissions
    FROM weeks w
    LEFT JOIN (
      SELECT date_trunc('week', created_at) AS wk, COUNT(*)::int AS c
      FROM copilot_teachers GROUP BY wk
    ) t ON t.wk = w.week_start
    LEFT JOIN (
      SELECT wk, SUM(c)::int AS c FROM (
        SELECT date_trunc('week', created_at) AS wk, COUNT(*)::int AS c FROM copilot_lesson_plans GROUP BY 1
        UNION ALL
        SELECT date_trunc('week', created_at), COUNT(*)::int FROM copilot_worksheets GROUP BY 1
        UNION ALL
        SELECT date_trunc('week', created_at), COUNT(*)::int FROM copilot_quizzes GROUP BY 1
        UNION ALL
        SELECT date_trunc('week', created_at), COUNT(*)::int FROM copilot_parent_drafts GROUP BY 1
      ) u GROUP BY wk
    ) r ON r.wk = w.week_start
    LEFT JOIN (
      SELECT date_trunc('week', submitted_at) AS wk, COUNT(*)::int AS c
      FROM copilot_submissions GROUP BY wk
    ) s ON s.wk = w.week_start
    ORDER BY w.week_start ASC
  `);

  const weeklyActivity = (weekly.rows as Array<{ week_start: Date | string; teachers: number; resources: number; submissions: number }>).map((r) => ({
    weekStart: new Date(r.week_start).toISOString(),
    teachers: Number(r.teachers ?? 0),
    resources: Number(r.resources ?? 0),
    submissions: Number(r.submissions ?? 0),
  }));

  res.json({
    totals: {
      teachers: teachers[0]?.c ?? 0,
      activeTeachersThisWeek,
      classes: classes[0]?.c ?? 0,
      students: students[0]?.c ?? 0,
      lessonPlans: lessonPlans[0]?.c ?? 0,
      worksheets: worksheets[0]?.c ?? 0,
      quizzes: quizzes[0]?.c ?? 0,
      parentDrafts: parentDrafts[0]?.c ?? 0,
      assignments: assignments[0]?.c ?? 0,
      submissions: submissions[0]?.c ?? 0,
      pilotRequests: pilotRequestsCount[0]?.c ?? 0,
    },
    recentSignups: recentSignups.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })),
    recentPilotRequests: recentPilotRequests.map((p) => ({
      id: p.id,
      source: p.source,
      schoolName: p.schoolName,
      country: p.country,
      organization: p.organization,
      contactName: p.contactName,
      contactEmail: p.contactEmail,
      gradeLevels: p.gradeLevels,
      message: p.message,
      createdAt: p.createdAt.toISOString(),
    })),
    weeklyActivity,
  });
});

// Use the imported gte to keep tsc happy in case build prunes unused
void gte;

export default router;
