import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const adminPhone = process.env.ADMIN_PHONE_NUMBER;

// Initialize Twilio client (only if valid credentials are configured)
let client: ReturnType<typeof Twilio> | null = null;
if (accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    client = Twilio(accountSid, authToken);
  } catch (e) {
    console.log("📱 Twilio kunne ikke initialiseres:", e);
  }
}

export interface SendSMSOptions {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SendSMSOptions): Promise<boolean> {
  // Check if Twilio is configured
  if (!client || !twilioPhone) {
    console.log("📱 SMS (ikke konfigureret):", message);
    return false;
  }

  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    });
    console.log(`📱 SMS sendt til ${to}: ${message}`);
    return true;
  } catch (error) {
    console.error("📱 SMS fejl:", error);
    return false;
  }
}

// Send booking notification to admin
export async function sendBookingNotificationToAdmin(booking: {
  name: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  service: string;
  price: number;
}): Promise<boolean> {
  if (!adminPhone) {
    console.log("📱 Admin SMS (ikke konfigureret)");
    return false;
  }

  const message = `🚗 NY BOOKING\n\nNavn: ${booking.name}\nTelefon: ${booking.phone}\nAdresse: ${booking.address}\nDato: ${booking.date}\nTid: ${booking.time}\nService: ${booking.service}\nPris: ${booking.price} kr.`;

  return sendSMS({ to: adminPhone, message });
}

// Send confirmation to customer
export async function sendConfirmationToCustomer(phone: string, booking: {
  date: string;
  time: string;
  service: string;
  address: string;
}): Promise<boolean> {
  const message = `✅ Tak for din booking!\n\nVi glæder os til at se dig!\n\n📅 ${booking.date} kl. ${booking.time}\n🚗 ${booking.service}\n📍 ${booking.address}\n\nVi sender en påmindelse 1 time før.\n\n- CarWash`;

  return sendSMS({ to: phone, message });
}

// Send reminder to customer 1 hour before
export async function sendReminderToCustomer(phone: string, booking: {
  date: string;
  time: string;
  service: string;
  address: string;
}): Promise<boolean> {
  const message = `⏰ Påmindelse!\n\nDin bilvask er om 1 time!\n\n📅 ${booking.date} kl. ${booking.time}\n🚗 ${booking.service}\n📍 ${booking.address}\n\nVi venter på dig!\n\n- CarWash`;

  return sendSMS({ to: phone, message });
}
