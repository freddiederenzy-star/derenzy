// Shared booking storage
// In production, use a database instead

export interface Booking {
  id: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  price: number;
  createdAt: string;
  reminderSent?: boolean;
}

export const bookings: Booking[] = [];
