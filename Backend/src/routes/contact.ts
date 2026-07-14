import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import {
  ListContactMessagesQueryParams,
  SubmitContactMessageBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/contact", requireAdmin, async (req, res) => {
  const parse = ListContactMessagesQueryParams.safeParse(req.query);
  const params = parse.success ? parse.data : { page: 1, limit: 20 };
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.read !== undefined) conditions.push(eq(contactMessagesTable.read, params.read));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [messages, [{ count }]] = await Promise.all([
    db.select().from(contactMessagesTable).where(where).limit(limit).offset(offset).orderBy(desc(contactMessagesTable.createdAt)),
    db.select({ count: sql<number>`count(*)::int` }).from(contactMessagesTable).where(where),
  ]);

  res.json({ data: messages, total: count, page, limit });
});

router.post("/contact", async (req, res) => {
  const parse = SubmitContactMessageBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [message] = await db.insert(contactMessagesTable).values({
    ...parse.data,
    read: false,
  }).returning();
  res.status(201).json(message);
});

router.patch("/contact/:id/read", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [updated] = await db.update(contactMessagesTable).set({ read: true }).where(eq(contactMessagesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

export default router;
