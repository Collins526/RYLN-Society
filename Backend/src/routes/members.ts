import { Router } from "express";
import { db, membersTable } from "@workspace/db";
import { eq, like, or, sql, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  ListMembersQueryParams,
  UpdateMemberBody,
  UpdateProfileBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/members", requireAdmin, async (req, res) => {
  const parse = ListMembersQueryParams.safeParse(req.query);
  const params = parse.success ? parse.data : { page: 1, limit: 20 };

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.status) conditions.push(eq(membersTable.status, params.status as "pending" | "active" | "suspended" | "rejected"));
  if (params.search) conditions.push(or(like(membersTable.fullName, `%${params.search}%`), like(membersTable.email, `%${params.search}%`)));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [members, [{ count }]] = await Promise.all([
    db.select().from(membersTable).where(where).limit(limit).offset(offset).orderBy(membersTable.createdAt),
    db.select({ count: sql<number>`count(*)::int` }).from(membersTable).where(where),
  ]);

  const membersOut = members.map(({ passwordHash: _, ...m }) => m);
  res.json({ data: membersOut, total: count, page, limit });
});

router.get("/members/profile", requireAuth, async (req, res) => {
  const user = (req as typeof req & { user: { id: number } }).user;
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, user.id)).limit(1);
  if (!member) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...memberOut } = member;
  res.json(memberOut);
});

router.patch("/members/profile", requireAuth, async (req, res) => {
  const user = (req as typeof req & { user: { id: number } }).user;
  const parse = UpdateProfileBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db.update(membersTable).set({ ...parse.data, updatedAt: new Date() }).where(eq(membersTable.id, user.id)).returning();
  const { passwordHash: _, ...memberOut } = updated;
  res.json(memberOut);
});

router.get("/members/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, id)).limit(1);
  if (!member) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...memberOut } = member;
  res.json(memberOut);
});

router.patch("/members/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parse = UpdateMemberBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db.update(membersTable).set({ ...parse.data, updatedAt: new Date() }).where(eq(membersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...memberOut } = updated;
  res.json(memberOut);
});

router.delete("/members/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(membersTable).where(eq(membersTable.id, id));
  res.status(204).send();
});

export default router;
