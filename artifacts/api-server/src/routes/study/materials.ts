import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  db,
  studyMaterialsTable,
  studyConceptsTable,
  studyFlashcardsTable,
} from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireStudyUser } from "../../middlewares/auth.js";
import { generateJSON } from "../../lib/openai.js";

const router: IRouter = Router();
router.use(requireStudyUser);

const materialInputSchema = z.object({
  title: z.string().min(1).max(500),
  sourceType: z.enum(["paste", "url", "file"]),
  sourceUrl: z.string().max(1000).nullable().optional(),
  contentText: z.string().min(1).max(50000),
});

router.get("/", async (req, res) => {
  const userId = req.studyUser!.id;
  const rows = await db
    .select()
    .from(studyMaterialsTable)
    .where(eq(studyMaterialsTable.userId, userId))
    .orderBy(desc(studyMaterialsTable.createdAt));

  // Count concepts and flashcards per material
  const enriched = await Promise.all(
    rows.map(async (m) => {
      const concepts = await db
        .select({ count: sql<number>`count(*)` })
        .from(studyConceptsTable)
        .where(eq(studyConceptsTable.materialId, m.id));
      const flashcards = await db
        .select({ count: sql<number>`count(*)` })
        .from(studyFlashcardsTable)
        .where(eq(studyFlashcardsTable.materialId, m.id));
      return {
        ...m,
        conceptCount: Number(concepts[0]?.count ?? 0),
        flashcardCount: Number(flashcards[0]?.count ?? 0),
      };
    }),
  );
  res.json(enriched);
});

router.post("/", async (req, res) => {
  const parsed = materialInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const data = parsed.data;
  const userId = req.studyUser!.id;

  const [material] = await db
    .insert(studyMaterialsTable)
    .values({
      userId,
      title: data.title,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl ?? null,
      contentText: data.contentText,
    })
    .returning();

  // Fire-and-forget AI concept extraction
  void (async () => {
    try {
      const raw = await generateJSON<
        { concepts?: Array<{ title: string; explanation: string; difficulty: string; keyTerms: string[] }> } | Array<{ title: string; explanation: string; difficulty: string; keyTerms: string[] }>
      >(
        "You are an expert educator. Extract key concepts from the study material. Return JSON with a top-level array named 'concepts'. Each concept has: title, explanation (2-3 sentences), difficulty (easy/medium/hard), and keyTerms (array of important terms).",
        `Extract concepts from this material:\n\nTitle: ${data.title}\n\n${data.contentText.slice(0, 8000)}`,
        { kind: "study_concept_extraction" },
      );

      const conceptsData = Array.isArray(raw) ? raw : (raw as any).concepts ?? Object.values(raw).find(Array.isArray) ?? [];

      interface ExtractedConcept {
        title: string;
        explanation: string;
        difficulty: string;
        keyTerms: string[];
      }

      const conceptRows = conceptsData.map((c: ExtractedConcept) => ({
        userId,
        materialId: material.id,
        title: c.title,
        explanation: c.explanation,
        difficulty: ["easy", "medium", "hard"].includes(c.difficulty) ? c.difficulty : "medium",
        keyTerms: c.keyTerms ?? [],
      }));

      if (conceptRows.length > 0) {
        await db.insert(studyConceptsTable).values(conceptRows);

        // Auto-generate flashcards from concepts
        const flashcardRows = conceptRows.map((c: typeof conceptRows[number]) => ({
          userId,
          materialId: material.id,
          front: c.title,
          back: c.explanation,
          hint: c.keyTerms.length > 0 ? `Think about: ${c.keyTerms.slice(0, 3).join(", ")}` : null,
          intervalDays: 1,
          repetitions: 0,
          easeFactor: 2.5,
          nextReviewAt: new Date(),
          reviewCount: 0,
        }));
        await db.insert(studyFlashcardsTable).values(flashcardRows);
      }
    } catch (err) {
      req.log?.warn({ err }, "concept extraction failed");
    }
  })();

  res.status(201).json({
    ...material,
    conceptCount: 0,
    flashcardCount: 0,
  });
});

router.get("/:materialId", async (req, res) => {
  const userId = req.studyUser!.id;
  const materialId = req.params.materialId;
  const rows = await db
    .select()
    .from(studyMaterialsTable)
    .where(and(eq(studyMaterialsTable.userId, userId), eq(studyMaterialsTable.id, materialId)))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Material not found" });
    return;
  }
  res.json(rows[0]);
});

router.delete("/:materialId", async (req, res) => {
  const userId = req.studyUser!.id;
  const materialId = req.params.materialId;
  await db
    .delete(studyMaterialsTable)
    .where(and(eq(studyMaterialsTable.userId, userId), eq(studyMaterialsTable.id, materialId)));
  res.json({ success: true });
});

router.get("/:materialId/concepts", async (req, res) => {
  const userId = req.studyUser!.id;
  const materialId = req.params.materialId;
  const material = await db
    .select()
    .from(studyMaterialsTable)
    .where(and(eq(studyMaterialsTable.userId, userId), eq(studyMaterialsTable.id, materialId)))
    .limit(1);
  if (material.length === 0) {
    res.status(404).json({ error: "Material not found" });
    return;
  }
  const concepts = await db
    .select()
    .from(studyConceptsTable)
    .where(eq(studyConceptsTable.materialId, materialId));
  res.json(concepts);
});

export default router;
