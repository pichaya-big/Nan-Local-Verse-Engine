# 🎮 Client - Nan Local-Verse Engine Frontend

Frontend application for the Nan Local-Verse Engine platform. Built with Next.js 16, React 19, and Tailwind CSS, featuring two distinct experiences:
- **🏪 B2B Dashboard** for local business operators
- **🎮 B2C Gamification App** for tourists

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
client/
├── app/
│   ├── (auth)/              # 🔐 Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   │
│   ├── (operator)/          # 🏪 B2B Dashboard
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── analytics/
│   │   └── settings/
│   │
│   ├── (tourist)/           # 🎮 B2C Gamification App
│   │   ├── quests/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   └── discover/
│   │
│   ├── api/                 # API client utilities
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home/landing page
│   └── theme-provider.tsx   # Theme configuration
│
├── lib/                     # Utility functions
│   └── supabaseClient.ts    # Supabase initialization
│
├── scripts/                 # Utility scripts
│   └── seed.ts              # Database seeding
│
├── middleware.ts            # Next.js middleware
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🎨 Features

### B2B Dashboard (Operator Portal)
Located in `app/(operator)/`

- **Campaign Builder**: Create and manage AI-suggested marketing campaigns
- **Performance Tracking**: Monitor tourist footfall and campaign effectiveness
- **Weather Integration**: View weather triggers and automatic campaign activation
- **Settings & Profile**: Manage business information and preferences

### B2C App (Tourist Experience)
Located in `app/(tourist)/`

- **Quest System**: Complete missions to earn rewards
- **Random Rewards**: Spin the wheel for surprise rewards
- **Leaderboard**: Compete with other travelers
- **Local Discovery**: Browse nearby attractions, restaurants, and activities
- **Profile**: Track progress, achievements, and rewards

### Authentication
Located in `app/(auth)/`

- Login with email/password
- Signup for new accounts
- Password reset flow
- Protected routes using Supabase Auth

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (built-in) |
| **Icons** | Lucide React |
| **Language** | TypeScript |
| **Linting** | ESLint 9 |

---

## 📦 Available Scripts

```bash
# Development
npm run dev        # Start dev server (http://localhost:3000)

# Production
npm run build      # Build for production
npm start          # Start production server

# Linting & Code Quality
npm run lint       # Run ESLint

# Database
npm run seed       # Seed sample data (requires scripts/seed.ts)
```

---

## ⚙️ Environment Variables

Create `.env.local`:

```env
# Supabase (Frontend)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Get these values from [Supabase Console](https://supabase.com/dashboard)

---

## 🎭 Key Components

### Layout System
- **Root Layout** (`app/layout.tsx`) - Global setup, theme provider
- **Auth Layout** - Without navigation (for login/signup)
- **Operator Layout** - Dashboard sidebar + header
- **Tourist Layout** - Mobile-friendly quest interface

### Reusable Components
Located in `lib/components/` (or create a shared components folder)

- Navigation headers
- Theme switcher (via next-themes)
- Loading states
- Error boundaries

### Pages

| Route | Purpose | User |
|-------|---------|------|
| `/` | Landing page | All |
| `/login` | Login form | All |
| `/signup` | Registration | New users |
| `/operator/dashboard` | Business dashboard | Operators |
| `/operator/campaigns` | Campaign management | Operators |
| `/tourist/quests` | Quest interface | Tourists |
| `/tourist/leaderboard` | Rankings | Tourists |

---

## 🔗 API Integration

All API calls go through the backend server running on `NEXT_PUBLIC_API_URL`:

```typescript
// Example: client/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

Backend API documentation: See [server/README.md](../server/README.md)

---

## 🎨 Styling

### Tailwind CSS 4
- Uses utility-first approach
- Custom colors via Tailwind config
- Responsive design (mobile-first)

### Framer Motion
Used for smooth animations:
- Bird animations on landing page
- Transition effects between routes
- Interactive UI feedback

### Dark Mode
Configured with `next-themes`:
```tsx
<ThemeProvider attribute="class" defaultTheme="light">
  {children}
</ThemeProvider>
```

---

## 🧪 Testing

```bash
# Run ESLint (type checking)
npm run lint

# Manual testing recommendations:
# 1. Test both B2B and B2C flows
# 2. Verify responsive design on mobile
# 3. Check Supabase connection
# 4. Test auth flows (login, logout, signup)
```

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces for tourist app
- Desktop-optimized for operator dashboard

---

## 🔐 Security

- Supabase Auth handles authentication
- Row-level security (RLS) configured on Supabase
- CORS handled by backend server
- Environment variables for sensitive data (never commit .env.local)

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy directly
vercel deploy

# Or connect GitHub repo to Vercel dashboard
```

### Manual Deployment
```bash
npm run build
npm start  # Runs on port 3000
```

Set environment variables in your hosting platform's dashboard.

---

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and key in `.env.local`
- Check Supabase project is active
- Ensure RLS policies allow anonymous access if needed

### Port Already in Use
```bash
# Change port (Unix/Mac)
PORT=3001 npm run dev

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Framer Motion](https://www.framer.com/motion)

---

## 📞 Support

- Backend Issues? → See [server/README.md](../server/README.md)
- Overall Project? → See [README.md](../README.md)

---

**Built with ❤️ for Nan Province Tourism** 🌾🎮
