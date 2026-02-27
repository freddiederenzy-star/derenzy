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
  carModel: string;
};

const services: Service[] = [
  {
    id: "basic",
    name: "Basic Wash",
    description: "Exterior wash with soap and water, tire cleaning",
    price: 25,
    duration: 20,
  },
  {
    id: "standard",
    name: "Standard Wash",
    description: "Full exterior wash, interior vacuum, window cleaning",
    price: 45,
    duration: 40,
  },
  {
    id: "premium",
    name: "Premium Detail",
    description: "Full exterior & interior detail, wax, polish, leather treatment",
    price: 85,
    duration: 90,
  },
  {
    id: "express",
    name: "Express Wash",
    description: "Quick exterior wash - perfect for regular maintenance",
    price: 15,
    duration: 10,
  },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<Booking>({
    service: null,
    date: "",
    time: "",
    name: "",
    phone: "",
    carModel: "",
  });
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleServiceSelect = (service: Service) => {
    setBooking({ ...booking, service });
    setStep(2);
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setBooking({ ...booking, date, time });
  };

  const handleDetailsSubmit = (name: string, phone: string, carModel: string) => {
    setBooking({ ...booking, name, phone, carModel });
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
      carModel: "",
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
                <h1 className="text-2xl font-bold text-gray-900">SparkleWash</h1>
                <p className="text-sm text-gray-500">Professional Car Care</p>
                <p className="text-xs text-blue-600 font-medium mt-1">Only wash car inside</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="hidden sm:inline">📞</span>
              <span className="hidden sm:inline">+45 60 62 70 57</span>
            </div>
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
                  {s === 1 ? "Service" : s === 2 ? "Date & Time" : "Details"}
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
              Choose Your Wash
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Select the service that best fits your needs
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="group bg-white rounded-2xl p-6 text-left border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      ${service.price}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{service.duration} minutes</span>
                  </div>
                </button>
              ))}
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
              Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Pick Your Time
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Selected: <span className="font-semibold text-blue-600">{booking.service?.name}</span> - ${booking.service?.price}
            </p>

            {/* Date Picker */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📅 Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={booking.date}
                onChange={(e) => handleDateTimeSelect(e.target.value, booking.time)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Time Slots */}
            {booking.date && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-fadeIn">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ⏰ Select Time
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setBooking({ ...booking, date: booking.date, time });
                        setStep(3);
                      }}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                        booking.time === time
                          ? "bg-blue-500 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
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
              Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Your Details
            </h2>
            <p className="text-gray-600 text-center mb-8">
              {booking.service?.name} • {booking.date} at {booking.time}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                handleDetailsSubmit(
                  formData.get("name") as string,
                  formData.get("phone") as string,
                  formData.get("carModel") as string
                );
              }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 Phone Number
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
                  🚗 Car Model
                </label>
                <input
                  type="text"
                  name="carModel"
                  required
                  placeholder="e.g., Toyota Camry 2020"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{booking.service?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{booking.service?.duration} min</span>
                </div>
                <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">${booking.service?.price}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                ✓ Confirm Booking
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
              Booking Confirmed! 🎉
            </h2>
            <p className="text-gray-600 mb-8">
              We&apos;re looking forward to seeing you!
            </p>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-md mx-auto mb-8">
              <div className="space-y-4 text-left">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{booking.service?.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold">{booking.date}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold">{booking.time}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Car</span>
                  <span className="font-semibold">{booking.carModel}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-blue-600 text-xl">${booking.service?.price}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              A confirmation has been sent to <span className="font-semibold">{booking.phone}</span>
            </p>

            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Book Another Wash
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 SparkleWash. All rights reserved.</p>
          <p className="text-xs mt-2">123 Clean Street, Car City, CC 12345</p>
        </div>
      </footer>
    </div>
  );
}
