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

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with booking flow | ✅ Complete |
| `src/app/layout.tsx` | Root layout + metadata | ✅ Ready |
| `src/app/globals.css` | Global styles + animations | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

Completed: Full car wash booking website with:
- Service selection (Basic, Standard, Premium, Express washes)
- Date and time slot selection
- Customer information form (name, phone, car model)
- Booking confirmation with summary

Next steps depend on user requirements:
1. Add database persistence (use add-database recipe)
2. Add email/SMS notifications
3. Add admin dashboard
4. Add authentication

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
