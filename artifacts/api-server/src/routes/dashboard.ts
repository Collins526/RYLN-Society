import { Router } from "express";
import { db, membersTable, announcementsTable, activitiesTable, galleryTable, contactMessagesTable } from "@workspace/db";
import { eq, sql, gte, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

router.get("/dashboard/stats", requireAdmin, async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    [{ totalMembers }],
    [{ pendingMembers }],
    [{ activeMembers }],
    [{ totalAnnouncements }],
    [{ publishedAnnouncements }],
    [{ totalActivities }],
    [{ upcomingActivities }],
    [{ totalGalleryImages }],
    [{ unreadMessages }],
    [{ newRegistrationsThisMonth }],
  ] = await Promise.all([
    db.select({ totalMembers: sql<number>`count(*)::int` }).from(membersTable),
    db.select({ pendingMembers: sql<number>`count(*)::int` }).from(membersTable).where(eq(membersTable.status, "pending")),
    db.select({ activeMembers: sql<number>`count(*)::int` }).from(membersTable).where(eq(membersTable.status, "active")),
    db.select({ totalAnnouncements: sql<number>`count(*)::int` }).from(announcementsTable),
    db.select({ publishedAnnouncements: sql<number>`count(*)::int` }).from(announcementsTable).where(eq(announcementsTable.published, true)),
    db.select({ totalActivities: sql<number>`count(*)::int` }).from(activitiesTable),
    db.select({ upcomingActivities: sql<number>`count(*)::int` }).from(activitiesTable).where(eq(activitiesTable.status, "upcoming")),
    db.select({ totalGalleryImages: sql<number>`count(*)::int` }).from(galleryTable),
    db.select({ unreadMessages: sql<number>`count(*)::int` }).from(contactMessagesTable).where(eq(contactMessagesTable.read, false)),
    db.select({ newRegistrationsThisMonth: sql<number>`count(*)::int` }).from(membersTable).where(gte(membersTable.createdAt, monthStart)),
  ]);

  res.json({
    totalMembers,
    pendingMembers,
    activeMembers,
    totalAnnouncements,
    publishedAnnouncements,
    totalActivities,
    upcomingActivities,
    totalGalleryImages,
    unreadMessages,
    newRegistrationsThisMonth,
  });
});

router.get("/dashboard/public-stats", async (_req, res) => {
  const [[{ totalMembers }], [{ totalPrograms }]] = await Promise.all([
    db.select({ totalMembers: sql<number>`count(*)::int` }).from(membersTable).where(eq(membersTable.status, "active")),
    db.select({ totalPrograms: sql<number>`count(*)::int` }).from(activitiesTable).where(eq(activitiesTable.status, "completed")),
  ]);

  res.json({
    totalMembers,
    totalPrograms,
    yearsOfOperation: new Date().getFullYear() - 2018,
  });
});

export default router;
