# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Ready for development

**Booking Site**: ✅ Complete - Fully functional car wash booking website

The template is a clean Next.js 16 starter with TypeScript and Tailwind CSS 4. It's ready for AI-assisted expansion to build any type of application.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **Car Wash Booking Website** - Full booking flow with service selection, date/time picker, customer details, and confirmation page
- [x] **Time Slot Booking System** - Blue/gray time slots showing availability, Saturday-Sunday only (9-16)
- [x] **Smart Address Validation** - Automatically recognizes Charlottenlund addresses based on street names
- [x] **Admin Dashboard** - View all bookings at /admin with name, phone, address, date, time
- [x] **Booking API** - POST /api/bookings saves bookings, GET /api/bookings returns all bookings
- [x] **SQLite Database** - Added Drizzle ORM with SQLite for persistent booking storage
- [x] **MobilePay Payment Section** - Prominent green payment section on confirmation page with phone number +45 60 62 70 57
- [x] **Dynamic Time Slots** - Time slots now fetch from database and show booked slots as gray
- [x] **Price Update** - Changed price from 150kr to 149kr
- [x] **Performance Optimization** - Added date range filtering to booking API and caching headers for faster page loads
- [x] **Bug Fix: Summer Bookings** - Extended booking date range from 3 months to 1 year ahead so July bookings now show as booked
- [x] **Om Mig About Page** - New page at /om with Frederik's story explaining he's 14 years old and giving money to charity
- [x] **Navigation Menu** - Added header with link to /om page
- [x] **Dark Theme Redesign** - Complete redesign with dark premium theme, floating navigation, and hero section
- [x] **Service Name Update** - Changed from "Indvendig Rengøring" to "Indvendig Bilvaskning" with støvsugning og vaskning description
- [x] **Pay After Option** - Added "Betales efter rengøring" note under the price
- [x] **Hero Branding** - Added "Frederik's Bilvaskning" with animated gradient text in hero section
- [x] **Removed "Bestil nu" text** - Removed heading from service selection page
- [x] **Turso Database** - Created cloud Turso database for production (file-based SQLite doesn't work on Vercel)
- [x] **Migration Fix** - Updated migrate.ts to use DATABASE_URL environment variable

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with booking flow | ✅ Complete |
| `src/app/om/page.tsx` | About page with Frederik's story | ✅ Complete |
| `src/app/admin/page.tsx` | Admin dashboard to view all bookings | ✅ Complete |
| `src/app/api/bookings/route.ts` | API endpoint for saving/retrieving bookings | ✅ Complete |
| `src/db/schema.ts` | Database schema for bookings | ✅ Complete |
| `src/app/layout.tsx` | Root layout + metadata | ✅ Ready |
| `src/app/globals.css` | Global styles + animations | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

Completed: Full car wash booking website with:
- Service selection (Indvendig Bilvaskning)
- Date and time slot selection
- Time slots: Blue = available, Gray/strikethrough = booked
- Only Saturday and Sunday available (9:00 - 16:00)
- Customer information form (name, phone, address in Charlottenlund)
- Booking confirmation with payment after service
- Smart address validation (recognizes Charlottenlund street names)
- Admin page at /admin to view all bookings
- API endpoint at /api/bookings
- **SQLite database** - Bookings now persist between server restarts

Next steps depend on user requirements:
1. Add email/SMS notifications
2. Add authentication to admin page

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-27 | Added car wash booking website with full booking flow |
| 2026-03-03 | Added time slot booking with Saturday-Sunday restriction and booked slot display |
| 2026-03-03 | Added smart address validation for Charlottenlund |
| 2026-03-03 | Added admin page (/admin) to view all bookings + booking API |
| 2026-03-07 | Added SQLite database with Drizzle ORM for persistent booking storage |
| 2026-03-07 | Added dynamic time slots that fetch from database and show booked slots as gray |
| 2026-03-09 | Updated price to 150kr |
| 2026-03-10 | Updated price to 149kr and simplified booking text |
