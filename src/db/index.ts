import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Use environment variable for database path, default to local.db for development only
const dbUrl = process.env.DATABASE_URL;

// If no DATABASE_URL is set, throw an error (for production)
if (!dbUrl) {
  console.error("DATABASE_URL is not set! Bookings will not work in production.");
}

const client = createClient({
  url: dbUrl || "file:local.db",
});

export const db = drizzle(client, { schema });
