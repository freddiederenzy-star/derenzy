import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const isProduction = process.env.VERCEL === "1";
  const dbUrl = process.env.DATABASE_URL;
  
  try {
    // Test database connection by doing a simple query
    const testBookings = await db.select({ id: bookings.id }).from(bookings).limit(1);
    
    // Also get count
    const allBookings = await db.select().from(bookings);
    
    return NextResponse.json({
      status: "connected",
      environment: isProduction ? "production" : "development",
      databaseUrl: dbUrl ? dbUrl.replace(/\?authToken=.*/, "?authToken=HIDDEN") : "NOT SET",
      databaseType: dbUrl?.startsWith("libsql") ? "Turso (cloud)" : "local file",
      bookingCount: allBookings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorStr = String(error);
    
    // Analyze the error
    let errorType = "unknown";
    if (errorStr.includes("DATABASE_URL") || errorStr.includes("not set")) {
      errorType = "missing_database_url";
    } else if (errorStr.includes("connect") || errorStr.includes("network") || errorStr.includes("fetch")) {
      errorType = "connection_failed";
    } else if (errorStr.includes("auth") || errorStr.includes("token")) {
      errorType = "auth_failed";
    } else if (errorStr.includes("no such file") || errorStr.includes("SQLITE_CANTOPEN")) {
      errorType = "file_not_found";
    }
    
    return NextResponse.json({
      status: "error",
      environment: isProduction ? "production" : "development",
      errorType,
      databaseUrl: dbUrl ? "SET (value hidden)" : "NOT SET",
      databaseConfigured: !!dbUrl,
      isUsingLocalFile: dbUrl === "file:local.db",
      error: errorStr,
      timestamp: new Date().toISOString(),
      solution: errorType === "missing_database_url" 
        ? "Set DATABASE_URL environment variable in Vercel project settings"
        : errorType === "auth_failed"
        ? "Get auth token from Turso dashboard and update DATABASE_URL"
        : errorType === "file_not_found"
        ? "Use Turso cloud database instead of local file for production"
        : "Check Vercel logs for more details"
    }, { status: 500 });
  }
}
