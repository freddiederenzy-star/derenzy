import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { sendBookingNotificationToAdmin, sendConfirmationToCustomer } from "@/lib/sms";
import { desc } from "drizzle-orm";

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

export async function GET() {
  // Return all bookings from database (for admin purposes)
  const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  
  return NextResponse.json({ 
    bookings: allBookings,
    count: allBookings.length 
  });
}
