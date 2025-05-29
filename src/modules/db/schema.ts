import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

export const siteAuth = sqliteTable("site_auth", {
  siteId: text("site_id").primaryKey(),
  accessToken: text("access_token").notNull(),
  createdAt: text("created_at").default(
    "CURRENT_TIMESTAMP"
  ),
});

export const userAuth = sqliteTable("user_auth", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  accessToken: text("access_token").notNull(),
  siteId: text("site_id").notNull(),
  createdAt: text("created_at").default(
    "CURRENT_TIMESTAMP"
  ),
});
