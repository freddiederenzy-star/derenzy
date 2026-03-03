import { NextResponse } from "next/server";

// In-memory storage for bookings (in production, use a database)
const bookings: Array<{
  id: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  price: number;
  createdAt: string;
}> = [];

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
