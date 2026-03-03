import { NextResponse } from "next/server";
import { bookings } from "@/lib/bookings";
import { sendBookingNotificationToAdmin, sendConfirmationToCustomer } from "@/lib/sms";

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

    // Create booking
    const booking = {
      id: `booking-${Date.now()}`,
      service,
      date,
      time,
      name,
      phone,
      address,
      price,
      createdAt: new Date().toISOString(),
      reminderSent: false,
    };

    bookings.push(booking);

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
      booking,
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
  // Return all bookings (for admin purposes)
  return NextResponse.json({ 
    bookings: bookings.reverse(),
    count: bookings.length 
  });
}
