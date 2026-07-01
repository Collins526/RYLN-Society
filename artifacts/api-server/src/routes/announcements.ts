import { Router } from "express";
import { db, announcementsTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import {
  ListAnnouncementsQueryParams,
  CreateAnnouncementBody,
  UpdateAnnouncementBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/announcements", async (req, res) => {
  const parse = ListAnnouncementsQueryParams.safeParse(req.query);
  const params = parse.success ? parse.data : { page: 1, limit: 10 };
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.published !== undefined) {
    conditions.push(eq(announcementsTable.published, params.published));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [announcements, [{ count }]] = await Promise.all([
    db.select().from(announcementsTable).where(where).limit(limit).offset(offset).orderBy(desc(announcementsTable.createdAt)),
    db.select({ count: sql<number>`count(*)::int` }).from(announcementsTable).where(where),
  ]);

  res.json({ data: announcements, total: count, page, limit });
});

router.post("/announcements", requireAdmin, async (req, res) => {
  const parse = CreateAnnouncementBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const publishedAt = parse.data.published ? new Date() : null;
  const [announcement] = await db.insert(announcementsTable).values({
    ...parse.data,
    published: parse.data.published ?? false,
    publishedAt,
  }).returning();
  res.status(201).json(announcement);
});

router.get("/announcements/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [announcement] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id)).limit(1);
  if (!announcement) { res.status(404).json({ error: "Not found" }); return; }
  res.json(announcement);
});

router.patch("/announcements/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parse = UpdateAnnouncementBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const existing = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id)).limit(1);
  if (!existing[0]) { res.status(404).json({ error: "Not found" }); return; }

  const publishedAt = parse.data.published === true && !existing[0].publishedAt ? new Date() : existing[0].publishedAt;
  const [updated] = await db.update(announcementsTable).set({
    ...parse.data,
    publishedAt,
    updatedAt: new Date(),
  }).where(eq(announcementsTable.id, id)).returning();
  res.json(updated);
});

router.delete("/announcements/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  res.status(204).send();
});

export default router;
