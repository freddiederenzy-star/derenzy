import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bilvask - Book Din Bilvask",
  description: "Book your car wash appointment online. Professional interior cleaning services in Charlottenlund.",
  metadataBase: new URL("https://bilvaskcharlottenlund.kiloapps.io"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-blue-600 text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold text-lg">🚗 Freddys Dækservice</Link>
            <Link href="/om" className="text-blue-100 hover:text-white transition-colors">
              Om mig
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}