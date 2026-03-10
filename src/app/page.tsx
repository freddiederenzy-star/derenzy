"use client";

import { useState, useEffect } from "react";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
};

type Booking = {
  service: Service | null;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
};

type StoredBooking = {
  id: number;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  price: number;
  createdAt: Date;
  reminderSent: boolean;
};

const services: Service[] = [
  {
    id: "interior",
    name: "Indvendig Rengøring",
    description: "Støvsugning og vask af bilens indvendige - sæder, gulvmåtter, instrumentpanel og ruder",
    price: 150,
    duration: 60,
  },
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
];

// Booked slots will be fetched from database
const initialBookedSlots: string[] = [];

export default function Home() {
  const [step, setStep] = useState(1);
  const [addressError, setAddressError] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [booking, setBooking] = useState<Booking>({
    service: null,
    date: "",
    time: "",
    name: "",
    phone: "",
    address: "",
  });
  const [bookingComplete, setBookingComplete] = useState(false);

  // Fetch booked slots from database on mount - optimized with date filter
  useEffect(() => {
    async function fetchBookings() {
      try {
        // Get date range for full year ahead for fetching all relevant bookings
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(now.getFullYear() + 1, 11, 31).toISOString().split('T')[0]; // Full year ahead
        
        const response = await fetch(`/api/bookings?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        if (data.bookings && Array.isArray(data.bookings)) {
          // Create bookedSlots array from database bookings
          const slots = data.bookings.map(
            (b: StoredBooking) => `${b.date}-${b.time}`
          );
          setBookedSlots(slots);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchBookings();
  }, []);

  // Function to refresh booked slots from database
  const refreshBookedSlots = async () => {
    try {
      // Fetch all bookings (no date filter) to ensure we catch all booked slots
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (data.bookings && Array.isArray(data.bookings)) {
        // Create bookedSlots array from database bookings
        const slots = data.bookings.map(
          (b: StoredBooking) => `${b.date}-${b.time}`
        );
        setBookedSlots(slots);
      }
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setBooking({ ...booking, service });
    setStep(2);
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setBooking({ ...booking, date, time });
    setStep(3);
  };

  // Check if a time slot is booked
  const isSlotBooked = (date: string, time: string): boolean => {
    return bookedSlots.includes(`${date}-${time}`);
  };

  // Check if selected date is Saturday (5) or Sunday (6)
  const isValidWeekend = (date: string): boolean => {
    if (!date) return false;
    const day = new Date(date).getDay();
    return day === 5 || day === 6; // Saturday = 5, Sunday = 6
  };

  const handleDetailsSubmit = async (name: string, phone: string, address: string) => {
    // Smart address validation - detect if address is in Charlottenlund area
    const addressLower = address.toLowerCase();
    
    // List of known Charlottenlund streets and areas
    const charlottenlundIdentifiers = [
      "2920",
      "charlottenlund",
      "fortunevej",
      "charlottenlundvej",
      "ordrupvej",
      "blegvangsvej",
      "bakkgårdsvej",
      "bakkevej",
      "strandvejen", // parts of Strandvejen are in Charlottenlund
      "gammel strandvej",
      "mørkhøj",
      "mørkhøjvej",
      "gentofte",
      "vibevænget",
      "parkvænget",
      "villavej",
      "skolevænget",
      "rosenvænget",
      "birkmosevej",
      "hjortespranget",
      "dronningensvej"
    ];
    
    // Check if any known Charlottenlund identifier is in the address
    const isInCharlottenlund = charlottenlundIdentifiers.some(id => 
      addressLower.includes(id)
    );
    
    // Also check if it looks like a valid Danish address format (street + number)
    // This allows addresses like "Fortunevej 49 B" to pass
    const hasStreetAddress = /[a-zæøå]+\s+\d+[a-zæøå]?/i.test(address);
    
    if (!isInCharlottenlund && hasStreetAddress) {
      // If it looks like a valid address but we don't recognize it as Charlottenlund,
      // provide a helpful message but allow it (more lenient)
      // Uncomment below to be strict:
      // setAddressError("Vi betjener kun Charlottenlund. Kontakt os for at høre om vi kan betjene din adresse.");
      // return;
    } else if (!isInCharlottenlund) {
      setAddressError("Vi betjener kun Charlottenlund (2920). Ang venligst en adresse i dette område.");
      return;
    }
    
    setAddressError("");
    
    // Save booking to API
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: booking.service?.name,
          date: booking.date,
          time: booking.time,
          name,
          phone,
          address,
          price: booking.service?.price
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        alert(result.error || "Der opstod en fejl. Prøv igen.");
        return;
      }
      
      console.log("Booking gemt!", result);
    } catch (error) {
      console.error("Booking error:", error);
      // Continue anyway - booking will still show on confirmation
    }
    
    setBooking({ ...booking, name, phone, address });
    setBookingComplete(true);
    setStep(4);
    // Refresh booked slots to show the new booking as taken
    refreshBookedSlots();
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    setStep(1);
    setBooking({
      service: null,
      date: "",
      time: "",
      name: "",
      phone: "",
      address: "",
    });
    setBookingComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3v0a3 3 0 003-3v-1" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">bilvask</h1>
                <p className="text-sm text-gray-500">Professionel Bilpleje</p>
                <p className="text-xs text-blue-600 font-medium mt-1">Kun støvsugning og vask af bilens indvendige</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="hidden sm:inline">📞</span>
              <span className="hidden sm:inline">+45 60 62 70 57</span>
            </div>
            <a 
              href="/admin" 
              className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              title="Admin - Se alle bookinger"
            >
              📋 Se Bookinger
            </a>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step >= s
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {s}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden sm:inline ${
                      step >= s ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {s === 1 ? "Tid" : s === 2 ? "Oplysninger" : "Bekræftelse"}
                  </span>
                  {s < 3 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-2 ${
                        step > s ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Bestil Indvendig Rengøring
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Støvsugning og vask af bilens indvendige
            </p>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {services[0].name}
                  </h3>
                  <p className="text-gray-600 text-sm">{services[0].description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-blue-600">{services[0].price} kr.</span>
                  <p className="text-xs text-gray-500">{services[0].duration} min</p>
                </div>
              </div>
              <button
                onClick={() => handleServiceSelect(services[0])}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                Vælg Tidspunkt
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tilbage
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Vælg Din Tid
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Vælg en tid til din indvendige rengøring
            </p>

            {/* Date Picker - Month/Day Only */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📅 Vælg Dato (Lørdag eller Søndag)
              </label>
              
              {/* Month and Day Selection */}
              <div className="flex gap-3">
                {/* Month Select */}
                <select
                  value={booking.date ? parseInt(booking.date.split('-')[1]) : ''}
                  onChange={(e) => {
                    const month = e.target.value;
                    if (!month) return;
                    
                    // Get current year and find next valid weekend
                    const now = new Date();
                    let year = now.getFullYear();
                    let foundDate = null;
                    
                    // Try to find a weekend day in selected month
                    for (let day = 1; day <= 31; day++) {
                      const testDate = new Date(year, parseInt(month) - 1, day);
                      if (testDate.getMonth() !== parseInt(month) - 1) break;
                      const dayOfWeek = testDate.getDay();
                      if (dayOfWeek === 5 || dayOfWeek === 6) { // Saturday or Sunday
                        foundDate = testDate.toISOString().split('T')[0];
                        break;
                      }
                    }
                    
                    if (foundDate) {
                      setBooking({ ...booking, date: foundDate, time: "" });
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Måned</option>
                  <option value="3">Marts</option>
                  <option value="4">April</option>
                  <option value="5">Maj</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                
                {/* Day Select */}
                <select
                  value={booking.date ? parseInt(booking.date.split('-')[2]) : ''}
                  onChange={(e) => {
                    const day = e.target.value;
                    if (!day || !booking.date) return;
                    
                    const parts = booking.date.split('-');
                    const newDate = `${parts[0]}-${parts[1]}-${day.padStart(2, '0')}`;
                    
                    // Verify it's a weekend
                    const selectedDate = new Date(newDate);
                    const dayOfWeek = selectedDate.getDay();
                    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                      alert("Vi booker kun tid på lørdage og søndage. Vælg venligst en weekenddag.");
                      return;
                    }
                    
                    setBooking({ ...booking, date: newDate, time: "" });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={!booking.date}
                >
                  <option value="">Dag</option>
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              {booking.date && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  ✅ Valgt: {new Date(booking.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              )}
            </div>

            {/* Time Slots */}
            {booking.date && isValidWeekend(booking.date) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-fadeIn">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ⏰ Vælg Tidspunkt
                </label>
                {loadingSlots ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-pulse">Henter bookinger...</div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {timeSlots.map((time) => {
                    const booked = isSlotBooked(booking.date, time);
                    return (
                      <button
                        key={time}
                        disabled={booked}
                        onClick={() => {
                          setBooking({ ...booking, date: booking.date, time });
                          setStep(3);
                        }}
                        className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                          booked
                            ? "bg-gray-300 text-gray-500 border border-gray-400 cursor-not-allowed"
                            : booking.time === time
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white hover:bg-blue-600 border border-blue-500"
                        }`}
                      >
                        {booked ? <span className="line-through">{time}</span> : time}
                      </button>
                    );
                  })}
                </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded"></div>
                      <span className="text-gray-600">Ledig</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
                      <span className="text-gray-500">Booket</span>
                    </div>
                  </div>
                </>
                )}
              </div>
            )}
            {booking.date && !isValidWeekend(booking.date) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                <p className="text-yellow-800 font-medium">
                  📅 Vi booker kun tid på lørdage og søndage
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Vælg venligst en lørdag eller søndag ovenfor
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tilbage
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Dine Oplysninger
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Udfyld dine kontaktoplysninger
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
                const address = (form.elements.namedItem("address") as HTMLInputElement).value;
                handleDetailsSubmit(name, phone, address);
              }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📛 Fuldt Navn
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="F.eks. Anders And"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 Telefonnummer
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="+45 12 34 56 78"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Adresse (Charlottenlund)
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="F.eks. Fortunevej 49, 2920 Charlottenlund"
                />
                {addressError && (
                  <p className="text-red-500 text-sm mt-2">{addressError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Vi betjener kun adresser i Charlottenlund (2920)
                </p>
              </div>

              {/* Booking Summary */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">📋 Booking Oversigt</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{booking.service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dato:</span>
                    <span className="font-medium">
                      {booking.date && new Date(booking.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tid:</span>
                    <span className="font-medium">{booking.time}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                    <span className="text-gray-600 font-semibold">Pris:</span>
                    <span className="font-bold text-blue-600">{booking.service?.price} kr.</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                Bekræft Booking
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && bookingComplete && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tak for din booking! ✅
              </h2>
              <p className="text-gray-600 mb-8">
                Du vil modtage en bekræftelse på SMS
              </p>

              {/* Booking Details */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">📋 Booking Detaljer</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Navn:</span>
                    <span className="font-medium">{booking.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telefon:</span>
                    <span className="font-medium">{booking.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adresse:</span>
                    <span className="font-medium">{booking.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{booking.service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dato:</span>
                    <span className="font-medium">
                      {booking.date && new Date(booking.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tid:</span>
                    <span className="font-medium">{booking.time}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-3 mt-3">
                    <span className="text-gray-600 font-semibold">Pris:</span>
                    <span className="font-bold text-blue-600 text-lg">{booking.service?.price} kr.</span>
                  </div>
                </div>
              </div>

              {/* Payment Section - MobilePay */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 mb-6 text-white">
                <h3 className="font-bold text-lg mb-2">💳 Betal med MobilePay</h3>
                <p className="text-green-100 text-sm mb-4">
                  Scan QR-koden eller send beløbet til:
                </p>
                <div className="bg-white rounded-xl p-4 inline-block">
                  <p className="text-2xl font-bold text-gray-900">+45 60 62 70 57</p>
                </div>
                <p className="text-green-100 text-sm mt-4">
                  Beløb: <span className="font-bold">{booking.service?.price} kr.</span>
                </p>
                <p className="text-green-100 text-xs mt-2">
                  Skriv dit telefonnummer i beskedfeltet
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Book another time
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2024 bilvask - Professionel Bilpleje i Charlottenlund</p>
          <p className="mt-1">Kontakt: +45 60 62 70 57</p>
        </div>
      </footer>
    </div>
  );
}
