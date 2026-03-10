"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Simple admin password - in production use environment variable
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bilvask";

type Booking = {
  id: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  price: number;
  createdAt: string;
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Forkert adgangskode");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("da-DK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        // Login Form
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
              <p className="text-gray-600 mt-2">Indtast adgangskode for at se bookinger</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adgangskode
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Indtast adgangskode"
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Log ind
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
                ← Tilbage til booking
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Bookings List
        <>
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📋 Admin - Bookinger</h1>
                <p className="text-gray-600">Oversigt over alle bookinger</p>
              </div>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Log ud
              </button>
            </div>
          </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Indlæser...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border">
            <p className="text-gray-600 text-lg">Ingen bookinger endnu</p>
            <p className="text-gray-500 mt-2">Bookinger vil dukke her op, når kunder booker tid</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">{bookings.length}</span> booking{bookings.length !== 1 ? "er" : ""} i alt
              </p>
            </div>

            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{booking.name}</h3>
                      <p className="text-sm text-gray-500">{formatDate(booking.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-600">{booking.price} kr.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📱</span>
                      <a href={`tel:${booking.phone}`} className="text-blue-600 hover:underline">
                        {booking.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Adresse:</span>
                      <span className="text-gray-700">{booking.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Dato:</span>
                      <span className="text-gray-700">{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Tidspunkt:</span>
                      <span className="text-gray-700">kl. {booking.time}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">Service: </span>
                      <span className="text-gray-700">{booking.service}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={fetchBookings}
              className="mt-6 w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              🔄 Opdater
            </button>
          </>
        )}
      </main>

      <footer className="text-center py-8 text-gray-500 text-sm">
        <Link href="/" className="hover:text-blue-600">← Tilbage til booking</Link>
      </footer>
        </>
      )}
    </div>
  );
}
