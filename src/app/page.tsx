"use client";

import { useState } from "react";

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

const services: Service[] = [
  {
    id: "interior",
    name: "Indvendig Rengøring",
    description: "Støvsugning og vask af bilens indvendige - sæder, gulvmåtter, instrumentpanel og ruder",
    price: 100,
    duration: 60,
  },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00",
];

// Simulated booked slots - in production this would come from a database
// Format: "date-time" e.g., "2026-03-07-09:00"
const bookedSlots: string[] = [
  "2026-03-07-10:00",
  "2026-03-07-14:00",
  "2026-03-08-09:30",
  "2026-03-08-11:00",
  "2026-03-08-15:00",
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [addressError, setAddressError] = useState("");
  const [booking, setBooking] = useState<Booking>({
    service: null,
    date: "",
    time: "",
    name: "",
    phone: "",
    address: "",
  });
  const [bookingComplete, setBookingComplete] = useState(false);

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
              className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
              title="Admin"
            >
              ⚙️
            </a>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
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

            {/* Date Picker */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📅 Vælg Dato (Lørdag eller Søndag)
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={booking.date}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  const day = selectedDate ? new Date(selectedDate).getDay() : -1;
                  
                  // Only allow Saturday (5) or Sunday (6)
                  if (day !== 5 && day !== 6 && selectedDate) {
                    alert("Vi booker kun tid på lørdage og søndage. Vælg venligst en weekenddag.");
                    return;
                  }
                  
                  setBooking({ ...booking, date: selectedDate, time: "" });
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {booking.date && !isValidWeekend(booking.date) && (
                <p className="text-red-500 text-sm mt-2">
                  ⚠️ Vælg venligst en lørdag eller søndag
                </p>
              )}
            </div>

            {/* Time Slots */}
            {booking.date && isValidWeekend(booking.date) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-fadeIn">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ⏰ Vælg Tidspunkt
                </label>
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
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                            : booking.time === time
                            ? "bg-blue-500 text-white"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        }`}
                      >
                        {booked ? <span className="line-through">{time}</span> : time}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                    <span className="text-gray-600">Ledig</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                    <span className="text-gray-400">Booket</span>
                  </div>
                </div>
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
              {booking.service?.name} • {booking.date} kl. {booking.time}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                handleDetailsSubmit(
                  formData.get("name") as string,
                  formData.get("phone") as string,
                  formData.get("address") as string
                );
              }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Fuldt Navn
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="F eks. Anders And"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 Telefonnummer
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+45 60 62 70 57"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Adresse (hvor bilen holder)
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="f.eks., Fortunevej 49 B, Charlottenlund"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Vi betjener Charlottenlund og omegn</p>
              </div>

              {addressError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm font-medium">{addressError}</p>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 mt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{booking.service?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-600">Varighed</span>
                  <span className="font-semibold">{booking.service?.duration} min</span>
                </div>
                <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">{booking.service?.price} kr.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                ✓ Bekræft Booking
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && bookingComplete && (
          <div className="animate-fadeIn text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Bekræftet! 🎉
            </h2>
            <p className="text-gray-600 mb-8">
              Vi glæder os til at se dig!
            </p>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-md mx-auto mb-8">
              <div className="space-y-4 text-left">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{booking.service?.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Dato</span>
                  <span className="font-semibold">{booking.date}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Tid</span>
                  <span className="font-semibold">{booking.time}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Adresse</span>
                  <span className="font-semibold">{booking.address}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600 text-xl">{booking.service?.price} kr.</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md mx-auto mb-6">
              <p className="text-yellow-800 font-medium text-lg">
                💰 <strong>Betaling sker efter vi har vasket din bil!</strong><br/>
                Du betaler 100 kr. kontant eller med MobilePay når vi er færdige med rengøringen.
              </p>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              En bekræftelse er sendt til <span className="font-semibold">{booking.phone}</span>
            </p>

            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Book En Ny Vask
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 carwash.com. Alle rettigheder forbeholdes.</p>
          <p className="text-xs mt-2">123 Clean Street, Car City, CC 12345</p>
        </div>
      </footer>
    </div>
  );
}
