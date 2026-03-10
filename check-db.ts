import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/db/schema";

const client = createClient({
  url: "file:local.db",
});

const db = drizzle(client, { schema });

async function main() {
  const allBookings = await db.select().from(schema.bookings);
  console.log("All bookings:", JSON.stringify(allBookings, null, 2));
}

main();
