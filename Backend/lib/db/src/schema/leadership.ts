import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadershipTable = pgTable("leadership", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadershipSchema = createInsertSchema(leadershipTable).omit({ id: true, createdAt: true });
export type InsertLeadership = z.infer<typeof insertLeadershipSchema>;
export type LeadershipMember = typeof leadershipTable.$inferSelect;
