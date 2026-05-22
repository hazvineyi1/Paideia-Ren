import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, pilotRequestsTable } from "@workspace/db";

const router: IRouter = Router();

const schema = z.object({
  source: z.string().min(1).max(60),
  schoolName: z.string().max(200).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  gradeLevels: z.string().max(60).optional().nullable(),
  organization: z.string().max(200).optional().nullable(),
  contactName: z.string().min(2).max(120),
  contactEmail: z.string().email().max(200),
  message: z.string().max(2000).optional().nullable(),
});

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const d = parsed.data;
  const [row] = await db
    .insert(pilotRequestsTable)
    .values({
      source: d.source,
      schoolName: d.schoolName?.trim() || null,
      country: d.country?.trim() || null,
      gradeLevels: d.gradeLevels?.trim() || null,
      organization: d.organization?.trim() || null,
      contactName: d.contactName.trim(),
      contactEmail: d.contactEmail.trim().toLowerCase(),
      message: d.message?.trim() || null,
    })
    .returning();
  res.status(201).json({ ok: true, id: row?.id });
});

export default router;
