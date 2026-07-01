import { Router } from "express";
import { db, activitiesTable } from "@workspace/db";
import { eq, like, sql, desc, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import {
  ListActivitiesQueryParams,
  CreateActivityBody,
  UpdateActivityBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/activities", async (req, res) => {
  const parse = ListActivitiesQueryParams.safeParse(req.query);
  const params = parse.success ? parse.data : { page: 1, limit: 10 };
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.status) conditions.push(eq(activitiesTable.status, params.status as "upcoming" | "ongoing" | "completed"));
  if (params.search) conditions.push(like(activitiesTable.title, `%${params.search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [activities, [{ count }]] = await Promise.all([
    db.select().from(activitiesTable).where(where).limit(limit).offset(offset).orderBy(desc(activitiesTable.createdAt)),
    db.select({ count: sql<number>`count(*)::int` }).from(activitiesTable).where(where),
  ]);

  res.json({ data: activities, total: count, page, limit });
});

router.post("/activities", requireAdmin, async (req, res) => {
  const parse = CreateActivityBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [activity] = await db.insert(activitiesTable).values({
    ...parse.data,
    status: parse.data.status as "upcoming" | "ongoing" | "completed",
  }).returning();
  res.status(201).json(activity);
});

router.get("/activities/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [activity] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, id)).limit(1);
  if (!activity) { res.status(404).json({ error: "Not found" }); return; }
  res.json(activity);
});

router.patch("/activities/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parse = UpdateActivityBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db.update(activitiesTable).set({
    ...parse.data,
    status: parse.data.status as "upcoming" | "ongoing" | "completed" | undefined,
    updatedAt: new Date(),
  }).where(eq(activitiesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/activities/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(activitiesTable).where(eq(activitiesTable.id, id));
  res.status(204).send();
});

export default router;
