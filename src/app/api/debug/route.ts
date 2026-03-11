import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    
    // Test database connection by doing a simple query
    const testBookings = await db.select({ id: bookings.id }).from(bookings).limit(1);
    
    // Also get count
    const allBookings = await db.select().from(bookings);
    
    return NextResponse.json({
      status: "connected",
      databaseUrl: dbUrl.replace(/\?authToken=.*/, "?authToken=HIDDEN"), // Hide token
      bookingCount: allBookings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      databaseUrl: process.env.DATABASE_URL ? "SET (value hidden)" : "NOT SET",
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
