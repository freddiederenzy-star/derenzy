import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Use environment variable for database path, default to local.db
const dbUrl = process.env.DATABASE_URL || "file:local.db";

const client = createClient({
  url: dbUrl,
});

export const db = drizzle(client, { schema });
