import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL || "file:local.db",
});

const db = drizzle(client, { schema });

// Create the bookings table
async function migrate() {
  console.log("Running migrations...");
  
  try {
    // Create bookings table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        price INTEGER NOT NULL,
        created_at INTEGER,
        reminder_sent INTEGER DEFAULT 0
      )
    `);
    console.log("✅ Bookings table created successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

migrate().then(() => {
  console.log("Migration complete!");
  process.exit(0);
});
