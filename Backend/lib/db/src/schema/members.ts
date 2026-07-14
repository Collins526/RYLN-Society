import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["admin", "member"]);
export const memberStatusEnum = pgEnum("member_status", ["pending", "active", "suspended", "rejected"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const membersTable = pgTable("members", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  nationalId: text("national_id").notNull(),
  gender: genderEnum("gender").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  occupation: text("occupation").notNull(),
  address: text("address").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("member"),
  status: memberStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMemberSchema = createInsertSchema(membersTable).omit({ id: true, passwordHash: true, role: true, status: true, createdAt: true, updatedAt: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof membersTable.$inferSelect;
