import { Router } from "express";
import { db, leadershipTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import {
  CreateLeadershipMemberBody,
  UpdateLeadershipMemberBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/leadership", async (_req, res) => {
  const members = await db.select().from(leadershipTable).orderBy(asc(leadershipTable.sortOrder), asc(leadershipTable.createdAt));
  res.json(members);
});

router.post("/leadership", requireAdmin, async (req, res) => {
  const parse = CreateLeadershipMemberBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [member] = await db.insert(leadershipTable).values({
    ...parse.data,
    sortOrder: parse.data.sortOrder ?? 0,
  }).returning();
  res.status(201).json(member);
});

router.patch("/leadership/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parse = UpdateLeadershipMemberBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db.update(leadershipTable).set(parse.data).where(eq(leadershipTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/leadership/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(leadershipTable).where(eq(leadershipTable.id, id));
  res.status(204).send();
});

export default router;
