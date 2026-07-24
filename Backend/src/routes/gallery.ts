import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { db, galleryTable } from "@workspace/db";
import { cloudinaryUploader } from "../lib/cloudinary";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import {
  ListGalleryQueryParams,
  CreateGalleryImageBody,
  UpdateGalleryImageBody,
} from "@workspace/api-zod";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads/gallery");
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

router.get("/gallery", async (req, res) => {
  const parse = ListGalleryQueryParams.safeParse(req.query);
  const params = parse.success ? parse.data : { page: 1, limit: 20 };
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const hostPrefix = (process.env.BACKEND_PUBLIC_URL ?? "").replace(/\/+$/, "") || `${req.protocol}://${req.get("host")}`;

  const conditions = [];
  if (params.category) conditions.push(eq(galleryTable.category, params.category as "events" | "community_service" | "meetings" | "trainings" | "workshops"));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [images, [{ count }]] = await Promise.all([
    db.select().from(galleryTable).where(where).limit(limit).offset(offset).orderBy(desc(galleryTable.createdAt)),
    db.select({ count: sql<number>`count(*)::int` }).from(galleryTable).where(where),
  ]);

  const normalized = images.map((image) => ({
    ...image,
    imageUrl: image.imageUrl && image.imageUrl.startsWith("/uploads") ? `${hostPrefix}${image.imageUrl}` : image.imageUrl,
  }));

  res.json({ data: normalized, total: count, page, limit });
});

router.post("/gallery", requireAdmin, async (req, res) => {
  const parse = CreateGalleryImageBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [image] = await db.insert(galleryTable).values({
    ...parse.data,
    category: parse.data.category as "events" | "community_service" | "meetings" | "trainings" | "workshops",
  }).returning();
  res.status(201).json(image);
});

router.post("/gallery/upload", requireAdmin, upload.single("image"), async (req, res) => {
  const title = String(req.body.title ?? "").trim();
  const category = String(req.body.category ?? "").trim();
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "Image file is required." });
    return;
  }

  if (!title) {
    res.status(400).json({ error: "Title is required." });
    return;
  }

  const allowedCategories = ["events", "community_service", "meetings", "trainings", "workshops"];
  if (!allowedCategories.includes(category)) {
    res.status(400).json({ error: "Invalid gallery category." });
    return;
  }

  try {
    const uploadResult = await cloudinaryUploader.uploader.upload(file.path, {
      folder: "ryln/gallery",
      resource_type: "image",
    });

    if (!uploadResult.secure_url) {
      throw new Error("Failed to upload image to Cloudinary.");
    }

    const imageUrl = uploadResult.secure_url;
    const [image] = await db.insert(galleryTable).values({
      title,
      category: category as "events" | "community_service" | "meetings" | "trainings" | "workshops",
      imageUrl,
    }).returning();

    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ error: "Image upload failed." });
  } finally {
    await fs.promises.unlink(file.path).catch(() => null);
  }
});

router.get("/gallery/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [image] = await db.select().from(galleryTable).where(eq(galleryTable.id, id)).limit(1);
  if (!image) { res.status(404).json({ error: "Not found" }); return; }
  res.json(image);
});

router.patch("/gallery/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parse = UpdateGalleryImageBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db.update(galleryTable).set({
    ...parse.data,
    category: parse.data.category as "events" | "community_service" | "meetings" | "trainings" | "workshops" | undefined,
  }).where(eq(galleryTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/gallery/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(galleryTable).where(eq(galleryTable.id, id));
  res.status(204).send();
});

export default router;
