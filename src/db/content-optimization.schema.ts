import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { projects } from "./app.schema";

// ============================================================================
// Content Optimization (On-Page.ai module): scan history per project and the
// instance-wide BYO API key connection.
// ============================================================================

export const contentScans = sqliteTable(
  "content_scans",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    jobId: text("job_id").notNull(),
    url: text("url").notNull(),
    keyword: text("keyword").notNull(),
    region: text("region").notNull().default("US"),
    score: integer("score"),
    grade: text("grade"),
    classifyJobId: text("classify_job_id"),
    pageCategory: text("page_category"),
    // Full customer-report payload as JSON text; a completed row keeps the
    // report readable without another provider call.
    report: text("report"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("content_scans_job_unique").on(table.jobId),
    index("content_scans_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
  ],
);

export const onpageConnection = sqliteTable("onpage_connection", {
  id: text("id").primaryKey(),
  apiKey: text("api_key"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  connectedAt: text("connected_at"),
});
