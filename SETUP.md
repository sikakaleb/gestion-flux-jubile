# Event Logistics PWA - Quick Start Guide

## ✅ What's Already Done

1. **Database Setup**: Supabase `passengers` table created with proper schema and RLS policies
2. **Sample Data**: 10 sample passengers inserted across multiple dates (Nov 26-29, 2025)
3. **Environment Variables**: Already configured in `.env` file
4. **Build Verification**: Project builds successfully with no errors

## 🚀 Getting Started

### 1. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile device or browser.

### 2. Test the Features

#### Main Dashboard
- **Arrivals/Departures Tabs**: Switch between arrival and departure views
- **Calendar Strip**: Scroll through dates (Nov 26-29 have sample data)
- **Passenger Cards**: View flight times, names, airlines, and accommodations
- **Status Badges**: Tap to cycle through states (pending → picked up → housed → pending)

#### Search Functionality
- Click the **Search icon** (🔍) in the header
- Type at least 2 characters of a passenger name
- Results appear instantly across all dates

#### Admin Import
- Click the **Settings icon** (⚙️) in the header
- Upload the sample CSV: `/public/sample-passengers.csv`
- Review import results

#### Stats Footer
- View real-time statistics at the bottom
- Shows totals for selected date/direction
- Updates automatically as you change statuses

## 📊 Sample Data Overview

**Nov 26, 2025** (Today):
- 3 Arrivals (2 pending, 1 picked up)
- 0 Departures

**Nov 27, 2025**:
- 2 Arrivals (pending)
- 1 Departure (pending)

**Nov 28, 2025**:
- 0 Arrivals
- 3 Departures (2 pending, 1 housed)

**Nov 29, 2025**:
- 1 Arrival (pending)
- 0 Departures

## 🎨 Design Highlights

- **Mobile-First**: Optimized for touch with 44px minimum targets
- **Apple-like UI**: Clean, professional slate color scheme
- **Real-Time**: Live updates across all connected devices
- **Responsive**: Works on phones, tablets, and desktops
- **PWA Ready**: Installable on mobile devices

## 🔧 Technical Features

### Performance Optimizations
- Optimistic UI updates (instant feedback)
- Memoized computed values
- Efficient date filtering
- Real-time Supabase subscriptions

### UX Enhancements
- Skeleton loading states
- Toast notifications
- Empty state messages
- Overdue passenger alerts (red ring)
- Smooth animations

### Accessibility
- Minimum 44px touch targets
- Proper ARIA labels
- Keyboard navigation support
- High contrast colors

## 📱 Mobile Installation (PWA)

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Install App" or "Add to Home Screen"
4. Tap "Install"

## 🔒 Security

- Row Level Security (RLS) enabled on database
- Public access configured for airport staff use
- Environment variables for sensitive credentials
- Input validation on CSV imports

## 🧪 Testing Checklist

- [ ] View arrivals for Nov 26
- [ ] View departures for Nov 28
- [ ] Change a passenger status
- [ ] Search for "Marie" or "Jean"
- [ ] Import sample CSV file
- [ ] Check stats footer updates
- [ ] Test on mobile device
- [ ] Install as PWA

## 📞 Production Deployment

For production deployment:

1. **Build**: `npm run build`
2. **Deploy**: Upload to Vercel, Netlify, or your hosting platform
3. **Environment**: Ensure production Supabase credentials are set
4. **Test**: Verify all features work in production
5. **Monitor**: Check Supabase dashboard for usage stats

## 🎯 Next Steps for Production

1. **Icons**: Replace placeholder PWA icons with branded versions
2. **Authentication**: Add staff login if needed
3. **Backup**: Set up automated database backups
4. **Monitoring**: Add error tracking (Sentry, LogRocket)
5. **Analytics**: Track usage patterns
6. **Offline Mode**: Enhance service worker for full offline support
7. **Push Notifications**: Alert staff of time-sensitive updates

---

**Built with**: Next.js 14, TypeScript, Tailwind CSS, Supabase, shadcn/ui
