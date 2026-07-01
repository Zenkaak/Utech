import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const chatMessagesTable = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  fromRole: text("from_role").notNull(),
  text: text("text").notNull(),
  timestamp: text("timestamp").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileType: text("file_type"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ChatMessageRow = typeof chatMessagesTable.$inferSelect;
