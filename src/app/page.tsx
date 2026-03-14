"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
    name: "Indvendig Bilvaskning",
    description: "Vi giver din bil en komplet indvendig rengøring!",
    price: 125,
    duration: 50,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
        
        // Handle error responses
        if (!response.ok) {
          console.error("API Error:", data.error || data);
          setBookedSlots([]);
          return;
        }
        
        // API returns array directly, not { bookings: [...] }
        const bookings = Array.isArray(data) ? data : (data.bookings || []);
        if (bookings && Array.isArray(bookings)) {
          // Create bookedSlots array from database bookings
          const slots = bookings.map(
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
      
      // Handle error responses
      if (!response.ok) {
        console.error("API Error:", data.error || data);
        setBookedSlots([]);
        return;
      }
      
      // API returns array directly, not { bookings: [...] }
      const bookings = Array.isArray(data) ? data : (data.bookings || []);
      if (bookings && Array.isArray(bookings)) {
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
    // Validate input
    if (!name || !phone || !address) {
      setAddressError("Alle felter skal udfyldes");
      return;
    }
    
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
    setSubmitError("");
    setIsSubmitting(true);
    
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
        setSubmitError(result.error || "Der opstod en fejl. Prøv igen.");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Booking gemt!", result);
    } catch (error) {
      console.error("Booking error:", error);
      // Show more helpful error message
      setSubmitError("Der opstod en fejl. Prøv igen om et øjeblik. Hvis problemet fortsætter, kontakt os telefonisk.");
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(false);
    
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">Frederik&apos;s Bilvaskning</span>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="/om" 
              className="text-xs bg-white/10 text-white/80 px-3 py-2 rounded-lg hover:bg-white/20 transition-all border border-white/10"
            >
              Om Mig
            </a>
            <a 
              href="/admin" 
              className="text-xs bg-white/10 text-white/80 px-3 py-2 rounded-lg hover:bg-white/20 transition-all border border-white/10"
            >
              Bookinger
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-4 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            <span className="text-cyan-300 text-sm font-medium">Charlottenlund</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 animate-gradient">
              Bilvaskning i Verdensklasse
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Grundig støvning af mig Frederik indvendig bilvaskning med støvsugning og vaskning i hele bilen.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-slate-400">
            <span className="text-slate-300">Premium kvalitet</span>
            <span className="text-slate-300">Hurtig service</span>
            <span className="text-slate-300">Sikker betaling</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-white/10 mb-6 hover:border-cyan-500/30 transition-all group">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {services[0].name}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-lg mb-4 leading-relaxed">{services[0].description}</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-2 text-slate-300">
                      <span className="text-cyan-400 mt-1">✓</span>
                      <span>Vi bruger Stjärnagloss Inni til interiørrens af hele kabinen</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <span className="text-cyan-400 mt-1">✓</span>
                      <span>Grundig støvsugning af hele bilen indvendig - sæder, tæpper og bagagerum</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <span className="text-cyan-400 mt-1">✓</span>
                      <span>Komplet vaskning af alle indvendige flader med sæbe og specialrengøring</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <span className="text-cyan-400 mt-1">✓</span>
                      <span>Grundig støvning af mig Frederik og pletfjerning af sæder, tæpper og polstring</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <span className="text-cyan-400 mt-1">✓</span>
                      <span>Dybrengøring og afviskning af alle plastdele, instrumentpanel og dørpuder</span>
                    </li>
                  </ul>
                  <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <Image 
                      src="https://www.cadetailing.co.uk/cdn/shop/files/AnyConv.com__INNI_GUN_1296x_7f8397f1-bbc3-4cfe-b37a-c3d91a1966f3.webp?v=1742904250&width=1600"
                      alt="Stjärnagloss Inni - Interiørrens"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="bg-green-500/20 text-green-300 px-4 py-3 rounded-xl border border-green-500/30 mb-4">
                    <span className="font-semibold text-base">Hele arbejdet udføres på adressen hvor bilen holder parkeret - du behøver ikke køre nogen steder hen! Vi har alle vaskemidlerne klar - du skal kun have en støvsuger klar.</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className="text-3xl font-bold text-cyan-400">{services[0].price} kr.</span>
                  <p className="text-xs text-slate-500">{services[0].duration} min</p>
                  <p className="text-xs text-green-400 mt-1 font-medium">Betales efter rengøring</p>
                </div>
              </div>
              <button
                onClick={() => handleServiceSelect(services[0])}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] transition-all"
              >
                Vælg Tidspunkt →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tilbage
            </button>

            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Vaskning
            </h2>
            <h3 className="text-xl font-bold text-cyan-400 mb-2 text-center">
              Vælg tidspunkt
            </h3>
            <p className="text-slate-400 text-center mb-8">
              Vælg en tid der passer dig
            </p>

            {/* Date Picker */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-white/10 mb-6">
              <label className="block text-sm font-semibold text-white mb-3">
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Vælg Dato (Lørdag eller Søndag)
                </span>
              </label>
              
              <div className="flex gap-3">
                <select
                  value={booking.date ? parseInt(booking.date.split('-')[1]) : ''}
                  onChange={(e) => {
                    const month = e.target.value;
                    if (!month) return;
                    
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    let year = now.getFullYear();
                    let foundDate = null;
                    
                    for (let day = 1; day <= 31; day++) {
                      const testDate = new Date(year, parseInt(month) - 1, day);
                      if (testDate.getMonth() !== parseInt(month) - 1) break;
                      // Skip dates in the past
                      if (testDate < today) continue;
                      const dayOfWeek = testDate.getDay();
                      if (dayOfWeek === 5 || dayOfWeek === 6) {
                        foundDate = testDate.toISOString().split('T')[0];
                        break;
                      }
                    }
                    
                    if (foundDate) {
                      setBooking({ ...booking, date: foundDate, time: "" });
                    } else {
                      alert("Ingen ledige weekenddage i denne måned. Vælg en anden måned.");
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
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
                
                <select
                  value={booking.date ? parseInt(booking.date.split('-')[2]) : ''}
                  onChange={(e) => {
                    const day = e.target.value;
                    if (!day || !booking.date) return;
                    
                    const parts = booking.date.split('-');
                    const newDate = `${parts[0]}-${parts[1]}-${day.padStart(2, '0')}`;
                    
                    const selectedDate = new Date(newDate);
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    
                    // Check if date is in the past
                    if (selectedDate < today) {
                      alert("Du kan ikke booke dage i fortiden. Vælg en dato fra i dag eller frem.");
                      return;
                    }
                    
                    const dayOfWeek = selectedDate.getDay();
                    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                      alert("Vi booker kun tid på lørdage og søndage. Vælg venligst en weekenddag.");
                      return;
                    }
                    
                    setBooking({ ...booking, date: newDate, time: "" });
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  disabled={!booking.date}
                >
                  <option value="">Dag</option>
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              {booking.date && (
                <p className="text-cyan-400 text-sm mt-2 font-medium">
                  ✅ Valgt: {new Date(booking.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              )}
            </div>

            {/* Time Slots */}
            {booking.date && isValidWeekend(booking.date) && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-white/10 animate-fadeIn">
                <label className="block text-sm font-semibold text-white mb-3">
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vælg Tidspunkt
                  </span>
                </label>
                {loadingSlots ? (
                  <div className="text-center py-4 text-slate-400">
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
                            ? "bg-slate-700/50 text-slate-500 border border-slate-600 cursor-not-allowed"
                            : booking.time === time
                            ? "bg-cyan-500 text-white"
                            : "bg-blue-500 text-white hover:bg-blue-600 border border-blue-400 hover:border-blue-300"
                        }`}
                      >
                        {booked ? <span className="line-through">{time}</span> : time}
                      </button>
                    );
                  })}
                </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2 text-blue-400"><span className="w-3 h-3 bg-blue-500 rounded"></span> Ledig</span>
                    <span className="text-slate-500">Booket</span>
                  </div>
                </>
                )}
              </div>
            )}
            {booking.date && !isValidWeekend(booking.date) && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <p className="text-yellow-400 font-medium">
                  Vi booker kun tid på lørdage og søndage
                </p>
                <p className="text-yellow-400/70 text-sm mt-1">
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
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tilbage
            </button>

            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Dine oplysninger
            </h2>
            <p className="text-slate-400 text-center mb-8">
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
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-white/10"
            >
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  📛 Fuldt Navn
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-slate-400"
                  placeholder="F.eks. Anders And"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  📱 Telefonnummer
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-slate-400"
                  placeholder="+45 12 34 56 78"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  📍 Adresse (Charlottenlund)
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-slate-400"
                  placeholder="F.eks. Fortunevej 49, 2920 Charlottenlund"
                />
                {addressError && (
                  <p className="text-red-400 text-sm mt-2">{addressError}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Vi betjener kun adresser i Charlottenlund (2920)
                </p>
              </div>

              {/* Booking Summary */}
              <div className="bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-600">
                <h3 className="font-semibold text-white mb-3">📋 Booking Oversigt</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service:</span>
                    <span className="font-medium text-white">{booking.service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dato:</span>
                    <span className="font-medium text-white">
                      {booking.date && new Date(booking.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tid:</span>
                    <span className="font-medium text-white">{booking.time}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-2 mt-2">
                    <span className="text-slate-400 font-semibold">Pris:</span>
                    <span className="font-bold text-cyan-400">{booking.service?.price} kr.</span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? ' Booker...' : 'Bekræft Booking'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && bookingComplete && (
          <div className="animate-fadeIn">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Tak for din booking! 🎉
              </h2>
              <p className="text-slate-400 mb-8">
                Du vil modtage en bekræftelse på SMS
              </p>

              {/* Booking Details */}
              <div className="bg-slate-700/50 rounded-xl p-6 mb-6 text-left border border-slate-600">
                <h3 className="font-semibold text-white mb-4">📋 Booking Detaljer</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Navn:</span>
                    <span className="font-medium text-white">{booking.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telefon:</span>
                    <span className="font-medium text-white">{booking.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Adresse:</span>
                    <span className="font-medium text-white">{booking.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service:</span>
                    <span className="font-medium text-white">{booking.service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dato:</span>
                    <span className="font-medium text-white">
                      {booking.date && new Date(booking.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tid:</span>
                    <span className="font-medium text-white">{booking.time}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-3 mt-3">
                    <span className="text-slate-400 font-semibold">Pris:</span>
                    <span className="font-bold text-cyan-400 text-lg">{booking.service?.price} kr.</span>
                  </div>
                </div>
              </div>

              {/* Payment Section - MobilePay */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6 text-white shadow-lg shadow-green-500/25">
                <h3 className="font-bold text-lg mb-2">Betales efter vask med MobilePay</h3>
                <p className="text-green-100 text-sm mb-4">
                  Betales efter rengøringen er udført. Scan QR-koden eller send beløbet til:
                </p>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 inline-block">
                  <p className="text-2xl font-bold text-white">+45 60 62 70 57</p>
                </div>
                <p className="text-green-100 text-sm mt-4">
                  Beløb: <span className="font-bold">{booking.service?.price} kr.</span>
                </p>
                <p className="text-green-100/70 text-xs mt-2">
                  Skriv dit telefonnummer i beskedfeltet
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-slate-700 text-white py-3 rounded-xl font-medium hover:bg-slate-600 transition-colors border border-slate-600"
              >
                Book ny tid
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-white/10 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
          <p>© 2024 Frederik&apos;s Bilvaskning - Grundig Bilpleje i Charlottenlund</p>
          <p className="mt-1">Kontakt: +45 60 62 70 57</p>
        </div>
      </footer>
    </div>
  );
}
