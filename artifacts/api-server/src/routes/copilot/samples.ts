import { Router, type IRouter } from "express";
import { db, samplesTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const region = typeof req.query["region"] === "string" ? req.query["region"] : null;
  const kind = typeof req.query["kind"] === "string" ? req.query["kind"] : null;
  const conditions = [] as ReturnType<typeof eq>[];
  if (region) conditions.push(eq(samplesTable.region, region));
  if (kind) conditions.push(eq(samplesTable.kind, kind));
  const where = conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions);
  const rows = await db
    .select()
    .from(samplesTable)
    .where(where)
    .orderBy(desc(samplesTable.createdAt))
    .limit(100);
  res.json({ samples: rows });
});

router.get("/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  const rows = await db.select().from(samplesTable).where(eq(samplesTable.id, id)).limit(1);
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ sample: rows[0] });
});

export default router;
