import { NextResponse } from "next/server";
import { bookings } from "@/lib/bookings";
import { sendReminderToCustomer } from "@/lib/sms";

// This endpoint should be called every minute by a cron job
// It checks for bookings that start in exactly 1 hour and sends reminders

// Helper to parse time string "14:00" to Date
function parseBookingTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const bookingDate = new Date(dateStr);
  bookingDate.setHours(hours, minutes, 0, 0);
  return bookingDate;
}

// Helper to check if a booking is in exactly 1 hour
function isOneHourFromNow(bookingDate: Date): boolean {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  
  const diff = bookingDate.getTime() - oneHourFromNow.getTime();
  // Within 1 minute tolerance
  return Math.abs(diff) < 60 * 1000;
}

export async function GET() {
  const now = new Date();
  console.log(`🔔 Tjekker for påmindelser kl. ${now.toLocaleString("da-DK")}`);
  
  const remindersSent: string[] = [];
  const errors: string[] = [];

  for (const booking of bookings) {
    // Skip if reminder already sent
    if (booking.reminderSent) continue;

    try {
      const bookingDate = parseBookingTime(booking.date, booking.time);
      
      // Check if booking is today and in exactly 1 hour
      const bookingDateOnly = bookingDate.toDateString();
      const todayOnly = now.toDateString();
      
      if (bookingDateOnly === todayOnly && isOneHourFromNow(bookingDate)) {
        console.log(`📱 Sender påmindelse til ${booking.name} (${booking.phone})`);
        
        const sent = await sendReminderToCustomer(booking.phone, {
          date: booking.date,
          time: booking.time,
          service: booking.service,
          address: booking.address,
        });

        if (sent) {
          booking.reminderSent = true;
          remindersSent.push(booking.id);
        }
      }
    } catch (error) {
      console.error(`Fejl ved påmindelse for ${booking.id}:`, error);
      errors.push(booking.id);
    }
  }

  return NextResponse.json({
    success: true,
    checked: bookings.length,
    sent: remindersSent.length,
    reminders: remindersSent,
    errors: errors.length,
  });
}
