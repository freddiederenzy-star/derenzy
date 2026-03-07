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

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with booking flow | ✅ Complete |
| `src/app/admin/page.tsx` | Admin dashboard to view all bookings | ✅ Complete |
| `src/app/api/bookings/route.ts` | API endpoint for saving/retrieving bookings | ✅ Complete |
| `src/db/schema.ts` | Database schema for bookings | ✅ Complete |
| `src/app/layout.tsx` | Root layout + metadata | ✅ Ready |
| `src/app/globals.css` | Global styles + animations | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

Completed: Full car wash booking website with:
- Service selection (Indvendig Rengøring)
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
