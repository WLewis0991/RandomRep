<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/Neon_Auth-Better_Auth-00E699?logo=neon" alt="Neon Auth" />
</p>

<h1 align="center">RandomRep</h1>

<p align="center">
  AI-powered personalized training plans built from your goals, experience, and equipment.
  <br />
  <a href="#features"><strong>Explore Features »</strong></a>
  <br />
  <br />
  🚀 <strong>Live:</strong> <a href="https://randomrep.vercel.app">https://randomrep.vercel.app</a>
  <br />
  <br />
  <a href="#getting-started">Quick Start</a>
  ·
  <a href="#project-structure">Structure</a>
  ·
  <a href="#deployment">Deployment</a>
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
- **Plan History & Versioning** — Regenerate plans and browse every past version from the Profile page
- **Neon Auth** — Secure authentication via email/password with JWT-verified sessions (Better Auth)
- **Dark & Light Mode** — Toggle between themes with orange-red accent palette
- **Responsive Design** — Works on desktop and mobile

<br />

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 6, Tailwind CSS v4, React Router 7 |
| **Backend** | Express 5, TypeScript, bundler tsup |
| **Database** | PostgreSQL (Neon), Prisma 7 ORM |
| **Auth** | Neon Auth (Better Auth), JWT verified via `jose` + JWKS |
| **AI** | OpenRouter API (multi-model fallback) |
| **Icons** | Lucide React |
| **Build** | Vite 8, tsup |
| **Deploy** | Vercel (serverless + static), same-origin |

<br />

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/WLewis0991/RandomRep.git
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

- `VITE_NEON_AUTH_URL` — Your Neon Auth base URL
- `NEON_AUTH_URL` — Same Neon Auth base URL, used by the server to verify JWTs
- `DATABASE_URL` — Your PostgreSQL connection string (Neon)
- `OPENROUTER_KEY` — Your OpenRouter API key
- `OPENROUTER_MODEL` — Optional, defaults to `openai/gpt-oss-120b:free`
- `ALLOWED_ORIGINS` — Optional CORS allowlist, defaults to `http://localhost:5173`

> **Same-origin**: The frontend proxies API calls to `/api/*` on the same
> origin (Vite's dev proxy or Vercel's routing), so `VITE_API_URL` is
> optional and only needed when the API lives on a separate host.

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
│   │   └── ui/             # Button, Card, Select, Textarea, PlanDisplay, PlanHistory
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
│   │   ├── middleware/     # Auth (JWKS JWT), validation, rate limiting
│   │   ├── routes/         # Profile, Plan API routes
│   │   ├── app.ts          # createApp() shared Express assembly
│   │   └── vercel-handler.ts  # Serverless entry for Vercel
│   ├── tsup.config.ts      # Bundles server + serverless handler
│   └── generated/          # Generated Prisma client
├── scripts/                # E2E smoke test (e2e-smoke.mjs)
├── vercel.json             # Same-origin Vercel routing
├── .env                    # Frontend env vars
├── vite.config.ts
└── package.json
```

<br />

## Deployment

The app is deployed to **Vercel** (`https://randomrep.vercel.app`) with a
same-origin architecture — the Express API and the React static bundle are
served from a single domain.

- **Routing** (`vercel.json`): `/api/(.*)` is handled by the serverless
  Express handler; the React SPA gets a `filesystem` fallback to `/index.html`
- **Build**: the server is bundled with `tsup` into `server/dist-vercel/`,
  which `@vercel/node` picks up; the frontend is built with Vite into `dist/`
- **Database**: Neon PostgreSQL, with Neon Auth (Better Auth) sessions verified
  server-side by validating the issued JWT's signature against the Auth JWKS
  (via `jose`)
- **Pushing to `main`** triggers an automatic production deployment through the
  Git integration

<br />

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/profile` | Create or update user profile |
| POST   | `/api/plan/generate` | Generate a new training plan |
| GET    | `/api/plan/current` | Get the latest plan for a user |
| GET    | `/api/plan/history` | List all plan versions for a user |

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
