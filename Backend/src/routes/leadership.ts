import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { db, leadershipTable } from "@workspace/db";
import { cloudinaryUploader } from "../lib/cloudinary";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import {
  CreateLeadershipMemberBody,
  UpdateLeadershipMemberBody,
} from "@workspace/api-zod";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads/leadership");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

router.get("/leadership", async (req, res) => {
  const hostPrefix = (process.env.BACKEND_PUBLIC_URL ?? "").replace(/\/+$/, "") || `${req.protocol}://${req.get("host")}`;
  const members = await db.select().from(leadershipTable).orderBy(asc(leadershipTable.sortOrder), asc(leadershipTable.createdAt));
  const normalized = members.map((member) => ({
    ...member,
    imageUrl: member.imageUrl && member.imageUrl.startsWith("/uploads") ? `${hostPrefix}${member.imageUrl}` : member.imageUrl,
  }));
  res.json(normalized);
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

router.post("/leadership/upload", requireAdmin, upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Image file is required." });
    return;
  }

  try {
    const uploadResult = await cloudinaryUploader.uploader.upload(file.path, {
      folder: "ryln/leadership",
      resource_type: "image",
    });

    if (!uploadResult.secure_url) {
      throw new Error("Failed to upload image to Cloudinary.");
    }

    res.status(201).json({ imageUrl: uploadResult.secure_url });
  } catch (error) {
    res.status(500).json({ error: "Image upload failed." });
  } finally {
    await fs.promises.unlink(file.path).catch(() => null);
  }
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
