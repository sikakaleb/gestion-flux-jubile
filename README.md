# Event Logistics PWA

A production-ready, mobile-first Progressive Web App for managing 5000+ VIP airport transfers. Built for airport staff to track passenger arrivals and departures with real-time status updates.

## Features

- **Mobile-First Design**: Optimized for tablets and smartphones with Apple-like aesthetic
- **Real-Time Updates**: Live status synchronization across all devices via Supabase
- **Intelligent Calendar**: Scrollable date picker with passenger count badges
- **Status Management**: One-tap status cycling (pending → picked up → housed)
- **Global Search**: Quick passenger lookup across all dates
- **CSV Import**: Bulk passenger data import via admin panel
- **Overdue Alerts**: Visual indicators for pending passengers past flight time
- **PWA Support**: Installable app with offline capabilities

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **UI Library**: shadcn/ui components

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

The database migration has already been applied. The `passengers` table includes:

- `id` (uuid, primary key)
- `first_name`, `last_name` (text)
- `flight_date` (date), `flight_time` (text)
- `airline`, `accommodation` (text)
- `direction` ('arrival' | 'departure')
- `status` ('pending' | 'picked_up' | 'housed')

### 4. Import Sample Data

Use the admin panel (Settings icon in header) to import the sample CSV file located at `/public/sample-passengers.csv`.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Main Dashboard

- **Tabs**: Switch between Arrivals and Departures
- **Calendar Strip**: Select date to view passengers (today ± 3 days)
- **Passenger Cards**: Tap status badge to cycle through states
- **Search**: Click search icon to find passengers by name
- **Admin**: Click settings icon to import CSV data

### Status States

- **En attente** (Gray): Passenger pending pickup
- **Récupéré** (Green): Passenger picked up from airport
- **Hébergé** (Blue): Passenger checked into accommodation

### CSV Import Format

Required columns:
```csv
first_name,last_name,flight_date,flight_time,airline,accommodation,direction
```

- `flight_date`: YYYY-MM-DD format (e.g., 2025-11-26)
- `flight_time`: HH:MM format (e.g., 14:30)
- `direction`: either 'arrival' or 'departure'

## Project Structure

```
├── app/
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles
├── components/
│   ├── PassengerCard.tsx # Individual passenger card
│   ├── CalendarStrip.tsx # Date selector with counts
│   ├── SearchOverlay.tsx # Global search modal
│   ├── AdminImport.tsx   # CSV import dialog
│   ├── StatsFooter.tsx   # Statistics bar
│   └── SkeletonCard.tsx  # Loading state
├── lib/
│   └── supabaseClient.ts # Database client & types
└── public/
    ├── manifest.json     # PWA manifest
    └── sample-passengers.csv
```

## Build for Production

```bash
npm run build
npm run start
```

## PWA Installation

On mobile devices:
- **iOS**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Install App

## Performance Optimizations

- Optimistic UI updates for instant feedback
- Real-time subscriptions for live data sync
- Efficient date-based filtering
- Skeleton loading states
- Memoized computed values
- Touch-optimized 44px minimum targets

## Security

- Row Level Security (RLS) enabled on database
- Public read/write access for airport staff
- Environment variables for sensitive credentials
- Input validation on CSV imports

## License

MIT
