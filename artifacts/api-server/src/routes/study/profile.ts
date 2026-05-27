import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  db,
  studyLearnerProfilesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
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

  res.json(profile);
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
