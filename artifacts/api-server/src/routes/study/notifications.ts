import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, studyUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireStudyUser } from "../../middlewares/auth.js";
import { isValidE164 } from "../../lib/notifications/whatsapp.js";

const router: IRouter = Router();
router.use(requireStudyUser);

// Current user's WhatsApp notification settings.
router.get("/settings", async (req, res) => {
  const user = req.studyUser!;
  res.json({
    whatsappNumber: user.whatsappNumber,
    whatsappOptIn: user.whatsappOptIn,
  });
});

const settingsSchema = z.object({
  whatsappNumber: z.string().trim().nullable().optional(),
  whatsappOptIn: z.boolean().optional(),
});

router.patch("/settings", async (req, res) => {
  const userId = req.studyUser!.id;
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.whatsappNumber !== undefined) {
    if (data.whatsappNumber === null || data.whatsappNumber === "") {
      updateData.whatsappNumber = null;
    } else if (!isValidE164(data.whatsappNumber)) {
      res.status(400).json({ error: "Number must be in international format, e.g. +263771234567" });
      return;
    } else {
      updateData.whatsappNumber = data.whatsappNumber.trim();
    }
  }
  if (data.whatsappOptIn !== undefined) {
    updateData.whatsappOptIn = data.whatsappOptIn;
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  // Cannot opt in without a number on file.
  if (updateData.whatsappOptIn === true) {
    const finalNumber =
      updateData.whatsappNumber !== undefined
        ? updateData.whatsappNumber
        : req.studyUser!.whatsappNumber;
    if (!finalNumber) {
      res.status(400).json({ error: "Add a WhatsApp number before opting in" });
      return;
    }
  }

  const [user] = await db
    .update(studyUsersTable)
    .set(updateData)
    .where(eq(studyUsersTable.id, userId))
    .returning();

  res.json({
    whatsappNumber: user.whatsappNumber,
    whatsappOptIn: user.whatsappOptIn,
  });
});

export default router;
