# DonateHub — Donation Management UI

A simple, well-structured Donation Management admin panel built with **React + Vite + Tailwind CSS**, styled in a **shadcn/ui-inspired** design system (same token-based approach ThemeWagon/shadcn admin templates use).

## Features (Phase 1 MVP)
- **Login** (mock auth, demo credentials below)
- **Dashboard** — total raised, this month, donor count, avg. donation, trend chart, recent donations
- **Donors** — full CRUD (add / edit / delete / search), shows total given per donor
- **Donations** — full CRUD (add / edit / delete / search / filter by purpose)

Data is stored in the browser (`localStorage`) with seed sample data, so you can try every CRUD action immediately with no backend. Swap `src/context/DataContext.jsx` and `src/context/AuthContext.jsx` for real API calls when your Express/MongoDB backend is ready — every function (`addDonor`, `updateDonation`, `login`, etc.) is already isolated there.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

**Demo login:**
- Email: `admin@donatehub.org`
- Password: `admin123`

## Project structure

```
src/
├── components/
│   ├── ui/            # Button, Card, Input, Badge, Modal — shadcn-style primitives
│   ├── layout/         # Sidebar, Topbar, DashboardLayout
│   ├── donors/         # DonorFormModal
│   └── donations/      # DonationFormModal
├── context/
│   ├── AuthContext.jsx # mock login/logout — replace with real API
│   └── DataContext.jsx # donors + donations CRUD state — replace with real API
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Donors.jsx
│   └── Donations.jsx
├── lib/utils.js         # cn(), formatCurrency(), formatDate(), initials()
├── App.jsx              # routes + auth guard
└── index.css            # design tokens (colors, radius) as CSS variables
```

## Connecting to your Node/Express + MongoDB backend

Replace the local-storage logic in `DataContext.jsx` with `axios` calls to your existing planned routes:

```
GET/POST/PUT/DELETE  /api/donors
GET/POST/PUT/DELETE  /api/donations
POST                 /api/auth/login
```

The component layer (pages, forms, tables) won't need to change — they only call `useData()` / `useAuth()`.

## Next steps (Phase 2, optional)
- Campaigns/Causes module
- Reports + export to PDF/Excel
- Role-based access (Admin vs Staff)
- Donation receipts by email
