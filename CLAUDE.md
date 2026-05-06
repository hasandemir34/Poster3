# Framely — Project Guide

## Stack
- Next.js 14 App Router (TypeScript)
- Supabase SSR (`@supabase/ssr` + `@supabase/supabase-js`)
- Tailwind CSS (custom theme, no UI libraries)
- Resend via Supabase SMTP (dashboard config, no code needed)

## File Map
```
app/
  page.tsx                  — Landing page (Server Component)
  layout.tsx                — Root layout, DM Sans font, bg-off-white
  globals.css               — Tailwind + Google Fonts import
  (auth)/login/page.tsx     — Login form (useSearchParams wrapped in Suspense)
  (auth)/signup/page.tsx    — Signup form + email confirmation screen
  editor/page.tsx           — Server Component: fetches products, renders EditorShell
  editor/EditorShell.tsx    — Client Component: holds slot state, product switcher
  api/orders/route.ts       — POST /api/orders — creates order + order_item rows

components/
  ui/Button.tsx             — variant: primary|secondary|ghost, size: sm|md|lg, loading spinner
  ui/Modal.tsx              — backdrop + Escape key + aria-modal
  editor/PhotoCell.tsx      — single grid cell, click=upload, right-click/long-press=zoom modal, drag-and-drop source/target
  editor/ZoomPanModal.tsx   — drag/pinch/scroll zoom+pan, Apply saves back to slot state
  editor/PosterGrid.tsx     — CSS Grid 5 cols × N rows, gap 2px, max-w 600px
  editor/DragGhost.tsx      — semi-transparent floating thumbnail during drag operations
  editor/useDragDrop.ts     — custom hook: HTML5 DnD + touch long-press drag, swap/move logic
  editor/OrderButton.tsx    — generates PNG → uploads to Storage → POST /api/orders

lib/
  types.ts                  — ALL shared interfaces (Product, Order, PhotoSlot, etc.)
  canvas.ts                 — OffscreenCanvas PNG export 2000×2000px (no html2canvas)
  supabase/client.ts        — createBrowserClient (use in Client Components)
  supabase/server.ts        — createServerClient + cookies() (use in Server Components)
  supabase/middleware.ts    — updateSession() called by root middleware

middleware.ts               — /editor requires auth → redirect /login
```

## DB Schema (Supabase)
```
profiles     — id (→ auth.users), full_name, address_json (jsonb)
products     — id, name, price, photo_count  [seeded: Classic 50 / Mini 35]
orders       — id, user_id (→ profiles), total, status ('pending')
order_items  — id, order_id, product_id, print_ready_url
```
RLS: users see only their own profiles/orders. Products are public read.
Storage bucket: `posters` — public read, auth upload to `{userId}/{timestamp}.png`.

## Tailwind Tokens
```
off-white   #F9F9F9   — page bg
cream       #F5F0E8   — grid bg, cards
charcoal    #2C2C2C   — text, buttons
muted       #9B9B9B   — secondary text
pastel-rose #F2D5D5   — errors
pastel-sage #D5E8D5   — success
pastel-sky  #D5E2F2   — accents
shadow: card | modal | subtle | lift
```

## Auth Flow
- `/editor` is public — no auth required to design
- Auth is triggered only when user clicks "Sipariş Ver" in OrderButton
- If not logged in → `AuthModal` opens (signup/login tabs, inline)
- After successful auth → address modal opens → order proceeds
- `middleware.ts` only redirects logged-in users away from `/login` and `/signup`
- `components/ui/AuthModal.tsx` — handles both signup and login in one modal

## Key Decisions
- `OffscreenCanvas` for PNG export (not html2canvas — CORS issues with blob: URLs)
- `@supabase/ssr` (auth-helpers-nextjs is deprecated)
- All types in `lib/types.ts` — never inline
- `EditorShell.tsx` = Client boundary; `editor/page.tsx` stays Server for SSR product fetch
- Login page uses `<Suspense>` around `useSearchParams()` (Next.js requirement)
- `<img>` used intentionally in PhotoCell/ZoomPanModal (blob: URLs, next/image can't handle them)

## Before Running
1. Fill `.env.local` with real values from Supabase Dashboard → Settings → API
2. Run SQL schema in Supabase SQL Editor (see plan file)
3. `npm run dev`
