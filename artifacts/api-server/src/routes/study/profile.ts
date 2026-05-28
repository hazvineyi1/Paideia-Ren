import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  db,
  studyLearnerProfilesTable,
  studyAssessmentsTable,
} from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { isLearningProfile } from "../../lib/prompts.js";
import { requireStudyUser } from "../../middlewares/auth.js";

const router: IRouter = Router();
router.use(requireStudyUser);

const updateSchema = z.object({
  goals: z.array(z.string()).optional(),
  examTarget: z.string().nullable().optional(),
  studyStyle: z.string().optional(),
  preferredSessionLength: z.number().int().min(5).max(120).optional(),
  preferredDifficulty: z.string().optional(),
  interests: z.array(z.string()).optional(),
  background: z.string().nullable().optional(),
  dailyStudyMinutes: z.number().int().min(5).max(480).optional(),
  timezone: z.string().nullable().optional(),
  // Diagnostic intake fields
  examDate: z.string().datetime().nullable().optional(),
  hoursPerWeek: z.number().int().min(1).max(80).nullable().optional(),
  baselineLevel: z.enum(["zero", "foundations", "solid", "rusty"]).nullable().optional(),
  calibrationSelfRating: z.enum(["high", "mid", "low", "under"]).nullable().optional(),
  failureMode: z.enum(["passive", "cram", "avoid", "scattered", "perfect"]).nullable().optional(),
});

router.get("/", async (req, res) => {
  const userId = req.studyUser!.id;
  let [profile] = await db
    .select()
    .from(studyLearnerProfilesTable)
    .where(eq(studyLearnerProfilesTable.userId, userId))
    .limit(1);

  if (!profile) {
    [profile] = await db
      .insert(studyLearnerProfilesTable)
      .values({
        userId,
        studyStyle: "balanced",
        preferredSessionLength: 25,
        preferredDifficulty: "mixed",
        dailyStudyMinutes: 30,
      })
      .returning();
  }

  // Attach the latest completed assessment's evidence-based LearningProfile (schemaVersion 1)
  // so the Profile page can render the canonical cognitive profile. We deliberately do not
  // store this on studyLearnerProfilesTable - assessments are the source of truth and the
  // profile refines as new assessments complete.
  const [latestAssessment] = await db
    .select({ results: studyAssessmentsTable.results })
    .from(studyAssessmentsTable)
    .where(and(eq(studyAssessmentsTable.userId, userId), eq(studyAssessmentsTable.status, "completed")))
    .orderBy(desc(studyAssessmentsTable.completedAt))
    .limit(1);
  // Validate the persisted profile against the canonical schema. Older assessments may have
  // a pre-canonical shape; we return null in that case rather than leaking a stale shape.
  const rawLearningProfile = (latestAssessment?.results as { learningProfile?: unknown } | null)?.learningProfile;
  const learningProfile = isLearningProfile(rawLearningProfile) ? rawLearningProfile : null;

  // Diagnostic intake is "complete" when the 5 onboarding signals are all set.
  // The path generator should adapt to these signals once available.
  const diagnosticComplete = Boolean(
    profile.examTarget &&
      profile.hoursPerWeek &&
      profile.baselineLevel &&
      profile.calibrationSelfRating &&
      profile.failureMode,
  );

  res.json({ ...profile, learningProfile, diagnosticComplete });
});

router.patch("/", async (req, res) => {
  const userId = req.studyUser!.id;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.goals !== undefined) updateData.goals = data.goals;
  if (data.examTarget !== undefined) updateData.examTarget = data.examTarget;
  if (data.studyStyle !== undefined) updateData.studyStyle = data.studyStyle;
  if (data.preferredSessionLength !== undefined) updateData.preferredSessionLength = data.preferredSessionLength;
  if (data.preferredDifficulty !== undefined) updateData.preferredDifficulty = data.preferredDifficulty;
  if (data.interests !== undefined) updateData.interests = data.interests;
  if (data.background !== undefined) updateData.background = data.background;
  if (data.dailyStudyMinutes !== undefined) updateData.dailyStudyMinutes = data.dailyStudyMinutes;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;
  if (data.examDate !== undefined) updateData.examDate = data.examDate ? new Date(data.examDate) : null;
  if (data.hoursPerWeek !== undefined) updateData.hoursPerWeek = data.hoursPerWeek;
  if (data.baselineLevel !== undefined) updateData.baselineLevel = data.baselineLevel;
  if (data.calibrationSelfRating !== undefined) updateData.calibrationSelfRating = data.calibrationSelfRating;
  if (data.failureMode !== undefined) updateData.failureMode = data.failureMode;
  updateData.updatedAt = new Date();

  const [profile] = await db
    .update(studyLearnerProfilesTable)
    .set(updateData)
    .where(eq(studyLearnerProfilesTable.userId, userId))
    .returning();

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(profile);
});

export default router;
