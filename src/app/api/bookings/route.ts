import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { sendBookingNotificationToAdmin, sendConfirmationToCustomer } from "@/lib/sms";
import { desc, and, gte, lte, eq } from "drizzle-orm";

// Cache control for faster subsequent loads
const CACHE_CONTROL = "public, s-maxage=30, stale-while-revalidate=60";

// Helper to check if we're in production (Vercel)
const isProduction = process.env.VERCEL === "1";

export async function POST(request: Request) {
  try {
    // Debug: log the database being used
    const dbUrl = process.env.DATABASE_URL || "file:local.db";
    console.log("=== NEW BOOKING REQUEST ===");
    console.log("Environment:", isProduction ? "production" : "development");
    console.log("Database URL:", dbUrl.replace(/\?authToken=.*/, "?authToken=HIDDEN"));
    
    // Check if database is properly configured
    if (isProduction && (!dbUrl || dbUrl === "file:local.db")) {
      console.error("DATABASE_URL not properly configured for production!");
      return NextResponse.json(
        { error: "Database er ikke konfigureret. Kontakt venligst administrator." },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { service, date, time, name, phone, address, price } = body;

    // Validate required fields
    if (!service || !date || !time || !name || !phone || !address) {
      return NextResponse.json(
        { error: "Alle felter skal udfyldes" },
        { status: 400 }
      );
    }

    // Create booking in database
    const [newBooking] = await db.insert(bookings).values({
      service,
      date,
      time,
      name,
      phone,
      address,
      price,
      createdAt: new Date(),
      reminderSent: false,
    }).returning();

    // Log booking for debugging
    console.log("=== NY BOOKING ===");
    console.log(`Navn: ${name}`);
    console.log(`Telefon: ${phone}`);
    console.log(`Adresse: ${address}`);
    console.log(`Dato: ${date}`);
    console.log(`Tid: ${time}`);
    console.log(`Service: ${service}`);
    console.log(`Pris: ${price} kr.`);
    console.log("==================");

    // Send SMS notifications (async - don't wait for them)
    // Send to admin
    sendBookingNotificationToAdmin({
      name,
      phone,
      address,
      date,
      time,
      service,
      price,
    });

    // Send confirmation to customer
    sendConfirmationToCustomer(phone, {
      date,
      time,
      service,
      address,
    });

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: "Booking modtaget!"
    });
  } catch (error) {
    console.error("Booking error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Der opstod en fejl ved booking";
    const errorStr = String(error);
    
    if (errorStr.includes("DATABASE_URL")) {
      errorMessage = "Database konfiguration fejler. Kontakt administrator.";
    } else if (errorStr.includes("connect") || errorStr.includes("network") || errorStr.includes("fetch")) {
      errorMessage = "Kan ikke forbinde til database. Prøv igen senere.";
    } else if (errorStr.includes("auth")) {
      errorMessage = "Database authentication fejler. Kontakt administrator.";
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorStr },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Debug: log the database being used
    const dbUrl = process.env.DATABASE_URL || "file:local.db";
    console.log("=== FETCHING BOOKINGS ===");
    console.log("Database URL:", dbUrl.replace(/\?authToken=.*/, "?authToken=HIDDEN"));

    // Get today's date to filter out old bookings
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all bookings first
    const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    
    console.log("Total bookings in DB:", allBookings.length);

    // Auto-delete bookings that have passed (both date AND time have passed)
    // Current time
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Delete bookings where the appointment time has passed
    // We need to compare both date AND time
    for (const booking of allBookings) {
      const bookingDate = new Date(booking.date);
      const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
      const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Parse time (format: "10:00")
      const [hours, minutes] = booking.time.split(':').map(Number);
      const bookingTimeInMinutes = hours * 60 + minutes;
      
      // Check if booking date is in the past
      if (bookingDateOnly < todayDateOnly) {
        // Date has passed, delete it
        console.log(`Deleting old booking: ${booking.name} on ${booking.date} at ${booking.time}`);
        await db.delete(bookings).where(eq(bookings.id, booking.id));
      } else if (bookingDateOnly.getTime() === todayDateOnly.getTime()) {
        // Same day - check if time has passed (with 2 hour buffer)
        if (bookingTimeInMinutes < currentTime - 120) {
          console.log(`Deleting today's expired booking: ${booking.name} at ${booking.time}`);
          await db.delete(bookings).where(eq(bookings.id, booking.id));
        }
      }
    }

    // Get bookings again after cleanup
    const filteredBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    
    // Return with cache headers
    return NextResponse.json(filteredBookings, {
      headers: {
        'Cache-Control': CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente bookinger", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a booking by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID er påkrævet" },
        { status: 400 }
      );
    }
    
    const bookingId = parseInt(id);
    
    // Delete the booking
    await db.delete(bookings).where(eq(bookings.id, bookingId));
    
    console.log(`Booking ${bookingId} deleted`);
    
    return NextResponse.json({ success: true, message: "Booking slettet" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette booking", details: String(error) },
      { status: 500 }
    );
  }
}
