<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

<h1 align="center">RandomRep</h1>

<p align="center">
  AI-powered personalized training plans built from your goals, experience, and equipment.
  <br />
  <a href="#features"><strong>Explore Features »</strong></a>
  <br />
  <br />
  <a href="#getting-started">Quick Start</a>
  ·
  <a href="#project-structure">Structure</a>
  ·
  <a href="#coming-soon">Roadmap</a>
</p>

<br />

## Screenshots

<!-- TODO: Add screenshots here -->

<br />

## Overview

RandomRep generates custom workout programs tailored to your fitness level, goals, available equipment, and schedule — all powered by AI. No more generic templates or cookie-cutter routines. Fill out your profile once and get a fresh, progressive plan built just for you.

<br />

## Features

- **AI-Generated Workout Plans** — Plans built by LLMs (OpenRouter) based on your unique profile
- **Profile-Based Customization** — Goals (cut, bulk, strength, endurance), experience level, days per week, session length, equipment, injuries
- **Split Types** — Full body, Upper/Lower, Push/Pull/Legs, or let AI decide
- **Plan History & Versioning** — Regenerate plans and track versions over time
- **Neon Auth** — Secure authentication via email/password and OAuth
- **Dark & Light Mode** — Toggle between themes with orange-red accent palette
- **Responsive Design** — Works on desktop and mobile

<br />

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 6, Tailwind CSS v4, React Router 7 |
| **Backend** | Express 5, TypeScript |
| **Database** | PostgreSQL (Neon), Prisma 7 ORM |
| **Auth** | Neon Auth (Better Auth) |
| **AI** | OpenRouter API (multi-model fallback) |
| **Icons** | Lucide React |
| **Build** | Vite 8, tsx |

<br />

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/randomrep.git
cd randomrep

# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Set up environment variables
cp .env.example .env
cp server/.env.example server/.env
```

Edit `.env` and `server/.env` with your credentials:

- `VITE_API_URL` — Your server URL (default: `http://localhost:3000`)
- `VITE_NEON_AUTH_URL` — Your Neon Auth project URL
- `DATABASE_URL` — Your PostgreSQL connection string (Neon)
- `OPENROUTER_KEY` — Your OpenRouter API key

### Database

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### Development

```bash
# Terminal 1 — start the server
cd server && npm run dev:server

# Terminal 2 — start the frontend
cd .. && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

<br />

## Project Structure

```
randomrep/
├── src/                    # Frontend (React + Vite)
│   ├── components/
│   │   ├── layout/         # Navbar
│   │   └── ui/             # Button, Card, Select, Textarea, PlanDisplay
│   ├── context/            # AuthProvider, ThemeProvider
│   ├── lib/                # API client, Auth client
│   ├── pages/              # Home, Onboarding, Profile, Auth, Account
│   └── types/              # TypeScript interfaces
├── server/                 # Backend (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Prisma migrations
│   ├── src/
│   │   ├── lib/            # AI service, Prisma client
│   │   └── routes/         # Profile, Plan API routes
│   └── generated/          # Generated Prisma client
├── .env                    # Frontend env vars
├── vite.config.ts
└── package.json
```

<br />

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/profile` | Create or update user profile |
| POST   | `/api/plan/generate` | Generate a new training plan |
| GET    | `/api/plan/current?userId=` | Get the latest plan for a user |

<br />

## Coming Soon

- **Nutrition Tracking** — Log meals, track macros, and get daily calorie targets aligned with your training goals
- **Meal Prep Recommendations** — AI-generated meal prep suggestions based on your dietary preferences, calorie targets, and training phase
- Workout tracking & logging
- Progress charts and analytics
- Exercise video demonstrations
- Mobile app (React Native)

<br />

## Contributing

Contributions are welcome! Open an issue or submit a pull request.

<br />

## License

[MIT](LICENSE)
