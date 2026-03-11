// Build timestamp for debugging deployment issues
console.log("Build time:", new Date().toISOString());

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Use environment variable for database path, default to local.db for development only
const dbUrl = process.env.DATABASE_URL;

// Log the database URL for debugging (hide auth token)
if (dbUrl) {
  console.log("Database URL configured:", dbUrl.replace(/\?authToken=.*/, "?authToken=HIDDEN"));
} else {
  console.error("DATABASE_URL is not set! Using fallback for development only.");
}

// Create client - this might fail if DATABASE_URL is invalid
let client;
try {
  client = createClient({
    url: dbUrl || "file:local.db",
  });
  console.log("Database client initialized successfully");
} catch (error) {
  console.error("Failed to create database client:", error);
  // Create a dummy client that will fail gracefully
  client = createClient({
    url: "file:local.db",
  });
}

export const db = drizzle(client, { schema });
