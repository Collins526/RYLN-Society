import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import {
  RegisterMemberBody,
  LoginMemberBody,
} from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parse = RegisterMemberBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { fullName, email, phone, nationalId, gender, dateOfBirth, occupation, address, password } = parse.data;

  const existing = await db.select().from(membersTable).where(eq(membersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const dobString = dateOfBirth instanceof Date ? dateOfBirth.toISOString().slice(0, 10) : String(dateOfBirth);
  const [member] = await db.insert(membersTable).values({
    fullName,
    email,
    phone,
    nationalId,
    gender: gender as "male" | "female" | "other",
    dateOfBirth: dobString,
    occupation,
    address,
    passwordHash,
    role: "member",
    status: "pending",
  }).returning();

  const token = signToken({ id: member.id, role: member.role, email: member.email });

  const { passwordHash: _, ...memberOut } = member;
  res.status(201).json({ token, member: memberOut });
});

router.post("/auth/login", async (req, res) => {
  const parse = LoginMemberBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { email, password } = parse.data;

  const [member] = await db.select().from(membersTable).where(eq(membersTable.email, email)).limit(1);
  if (!member) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ id: member.id, role: member.role, email: member.email });
  const { passwordHash: _, ...memberOut } = member;
  res.status(200).json({ token, member: memberOut });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = (req as typeof req & { user: { id: number } }).user;
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, user.id)).limit(1);
  if (!member) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { passwordHash: _, ...memberOut } = member;
  res.status(200).json(memberOut);
});

export default router;
