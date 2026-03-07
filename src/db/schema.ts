import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  service: text("service").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  price: integer("price").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  reminderSent: integer("reminder_sent", { mode: "boolean" }).default(false),
});
