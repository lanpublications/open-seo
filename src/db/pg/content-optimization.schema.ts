import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { projects } from "./app.schema";

// Timestamps are stored as *text* (same column shape as the SQLite schema); see
// the note in pg/app.schema.ts. `isoNow` matches `new Date().toISOString()` so
// DB-defaulted and app-written values sort together lexicographically.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
const timestampColumn = (name: string) => text(name);

// Postgres mirror of the Content Optimization tables. Column notes: see
// ../content-optimization.schema.ts.
export const contentScans = pgTable(
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
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("content_scans_job_unique").on(table.jobId),
    index("content_scans_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
  ],
);

export const onpageConnection = pgTable("onpage_connection", {
  id: text("id").primaryKey(),
  apiKey: text("api_key"),
  enabled: boolean("enabled").notNull().default(true),
  connectedAt: timestampColumn("connected_at"),
});
