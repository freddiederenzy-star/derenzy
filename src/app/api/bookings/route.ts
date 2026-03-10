import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { sendBookingNotificationToAdmin, sendConfirmationToCustomer } from "@/lib/sms";
import { desc, and, gte, lte } from "drizzle-orm";

// Cache control for faster subsequent loads
const CACHE_CONTROL = "public, s-maxage=30, stale-while-revalidate=60";

export async function POST(request: Request) {
  try {
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
    return NextResponse.json(
      { error: "Der opstod en fejl ved booking" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  // Build query filters for better performance
  let query = db.select().from(bookings);
  
  // If date range provided, filter by it (much faster)
  if (startDate && endDate) {
    // Filter bookings within the date range
    const allBookings = await db.select().from(bookings)
      .orderBy(desc(bookings.createdAt));
    
    const filteredBookings = allBookings.filter(b => 
      b.date >= startDate && b.date <= endDate
    );
    
    const response = NextResponse.json({ 
      bookings: filteredBookings,
      count: filteredBookings.length 
    });
    response.headers.set('Cache-Control', CACHE_CONTROL);
    return response;
  }
  
  // Default: Return all bookings (for admin purposes)
  const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  
  const response = NextResponse.json({ 
    bookings: allBookings,
    count: allBookings.length 
  });
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}
