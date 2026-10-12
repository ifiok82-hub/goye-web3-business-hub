# GOYE Web3 Business Hub

**Build. Automate. Trade. Pay. Grow.**  
AI + Web3 Business Infrastructure for the Global Digital Economy.

---

## Overview

**GOYE Web3 Business Hub** is an enterprise-grade digital business infrastructure and commerce platform designed to empower verified merchants, developers, and global digital entrepreneurs. Built with strict cryptographic verification, audit trails, and multi-rail payment integrity, GOYE bridges traditional commerce, African payment rails, and decentralized Web3 ecosystems.

### Core Capabilities

- **Business Identification & Cryptographic Verification**: Verifiable Business ID credentials (`GOYE-BIZ-XXXX-XXXXXX`), transparent tiered verification levels (Registered Profile → Documents Submitted → GOYE Reviewed → Identity Confirmed → Payment Enabled), and server-verified QR endpoints (`/api/verify/business/:id`, `/api/verify/invoice/:id`, `/api/verify/contract/:id`).
- **Payment Integrity & Multi-Rail Settlements**: Strict payment lifecycle enforcement (`Pending` → `Under Review` → `Paid`). Creating invoices or submitting payment claims never automatically marks orders as paid; payments require legitimate provider confirmation or authorized administrative reconciliation.
- **Official Pi Network Platform Integration**: Platform API v2 server-to-server payment approval (`/api/pi/approve`), Pioneer completion (`/api/pi/complete`), user verification (`/api/pi/verify-user`), and webhook processing. Strict anti-mocking architecture with zero simulated transactions.
- **Enterprise Smart Contracts & Invoicing**: Non-custodial contracts, mutual sign-off verification, and automated invoicing with multi-currency support (USD, NGN, Pi, OUSD, USDC, USDT).
- **Digital Trade Assurance**: Milestone-based escrow and non-custodial deal protection with verifiable stage transitions.
- **Autonomous AI Business Assistants**: Domain-specific conversational agents powered by server-side Google Gemini models (`gemini-2.5-flash`), lead capture, and zero client key exposure.
- **Immutable Audit Logging**: Persistent ledger recording administrative actions, payment transactions, verification upgrades, and Pi events.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Node.js, Express 4, TypeScript (`tsx` runtime)
- **Deployment & Serverless**: Vercel Serverless Functions (`/api`), standard Node.js standalone server
- **Database & Persistence**:
  - Production Interface: PostgreSQL / Cloud SQL Relational Architecture (25 normalized schemas)
  - Intermediate / Development: Atomic disk persistence (`./data/goye_database.json`) with serverless fallback
- **AI Engine**: Google Gemini API (`@google/genai` SDK) executed strictly server-side
- **Web3 / Payment Rails**: Official Pi Network Platform API v2, Pi JavaScript SDK v2, Paystack & Flutterwave webhook architecture

---

## Local Development Instructions

### Prerequisites

- Node.js (v20+ recommended)
- npm or bun

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/<your-username>/goye-web3-business-hub.git
cd goye-web3-business-hub
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your local environment variables according to the table below.

### 3. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000` with hot-reload Vite middleware and mounted Express backend routes.

---

## Build Instructions

To build the client SPA for production:

```bash
npm run build
```

The compiled assets will be output to the `dist/` directory.

To run type checking and lint validation:

```bash
npm run lint
```

To run the production server locally:

```bash
npm start
```

---

## Official Core Positioning

> **"Professional Web3 business services platform connecting entrepreneurs and organizations with digital solutions, AI services and Pi-enabled Web3 commerce."**

GOYE is positioned truthfully as a Web3-enabled digital business platform combining reliable conventional cloud infrastructure with cryptographic business identity and Pi Network commerce. It does not falsely claim to be a 100% decentralized blockchain or make unverified claims of government accreditation or Core Team endorsements.

---

## Required Environment Variables

> ⚠️ **CRITICAL SECURITY WARNING:**  
> **NEVER** commit `.env` or any production secrets to GitHub. All production secrets (`PI_API_KEY`, `GEMINI_API_KEY`, `GOYE_ADMIN_SECRET`, `DATABASE_URL`) must be configured exclusively through deployment environment settings (such as Vercel Project Settings or Cloud Run Environment Variables).

| Variable | Description | Default / Example | Required in Production |
| :--- | :--- | :--- | :--- |
| `PI_NETWORK_MODE` | Pi Network Environment Mode (`TESTNET` or `MAINNET`) | `TESTNET` | Yes |
| `PI_SANDBOX` | Pi SDK Sandbox Flag (set to `false` for Production Developer Review) | `false` | Yes |
| `PI_API_KEY` | Official Pi Developer Portal Platform API Key | *Configured in Portal* | Yes (for Pi payments) |
| `PI_APP_ID` | Official Pi Developer Application ID | *Configured in Portal* | Yes (for Pi payments) |
| `PI_OAUTH_CLIENT_ID` | Official Pi Developer Portal OAuth Public Client ID | `oyEFvUGrkruWe8giGoqhq5py6Q60F6dtMT_WQedySqk` | Yes (Public) |
| `PI_TESTNET_WALLET` | Public Testnet Wallet Address for developer testing | *Public Address* | Optional |
| `PI_MAINNET_WALLET` | Public Mainnet Wallet Address | `NOT CONFIGURED` | Disabled in Testnet |
| `GEMINI_API_KEY` | Server-Side Google Gemini API Key | *User Secret* | Yes (for AI features) |
| `DATABASE_URL` | PostgreSQL / Cloud SQL Database Connection String | `NOT CONFIGURED` | Yes (for production DB) |
| `GOYE_ADMIN_SECRET` | Secret token for `/api/admin/*` authorized operations | *Secure Random String* | Yes |
| `PAYSTACK_SECRET_KEY` | Secret Key for Paystack Payment Gateway | `NOT CONFIGURED` | Optional |
| `FLUTTERWAVE_SECRET_KEY` | Secret Key for Flutterwave Payment Gateway | `NOT CONFIGURED` | Optional |
| `PORT` | Local HTTP Port | `3000` | Optional |

---

## Official Pi Network Sign-in (OAuth 2.0 Implicit Flow)

GOYE Web3 Business Hub implements the official Pi Network OAuth 2.0 Sign-in specification for Pioneer authentication:

- **Authorization Endpoint**: `https://accounts.pinet.com/oauth/authorize`
- **Public Client ID**: `oyEFvUGrkruWe8giGoqhq5py6Q60F6dtMT_WQedySqk`
- **OAuth Grant Type**: Implicit Grant (`response_type=token`)
- **Minimum Required Scope**: `username`
- **Registered Production Redirect URI**: `https://goye-web3-business-hub.vercel.app/signin/callback`
- **Registered Local Development Redirect URI**: `http://localhost:3000/signin/callback`

### Security Standards & Architecture:
1. **CSRF Mitigation**: Cryptographically strong 192-bit state token stored in temporary session storage and strictly validated on callback (`/signin/callback`).
2. **Server-Side Source of Truth**: Pioneer access tokens are validated server-to-server directly against the official Pi Platform API (`GET https://api.minepi.com/v2/me`) before establishing an authenticated session.
3. **Strict Separation of Auth & Payments**: Pi Sign-in is strictly for Pioneer identity authentication. It never triggers or authorizes payments, orders, invoices, or contracts.
4. **Zero Wallet Passphrase**: GOYE never asks for, stores, or transmits Pi wallet passphrases or private keys.
5. **Anti-Simulation Policy**: No mock tokens, fake UIDs, or simulated Pioneers are accepted.

---

## Pi Platform Integration & Anti-Mock Policy

- **Current Network Mode**: `TESTNET`
- **Sandbox Mode**: `false` (Standard production architecture)
- **Mainnet**: **DISABLED**. Mainnet transactions remain disabled until official Pi Developer Portal review and production key validation are completed.
- **Strict Anti-Mock Policy**: GOYE does NOT simulate payments, invent txids, or forge wallet balances. If `PI_API_KEY` is not present in the backend environment, the system factually reports:
  > *"Pi payment verification is currently unavailable. Please try again later."*
- **Status Dashboard**: Visit the live `/pi-status` view to verify SDK readiness, OAuth configuration, API status, and server connectivity.

---

## GitHub Deployment Notes

1. Ensure `.gitignore` is active and prevents `.env`, `node_modules`, `dist`, logs, and temporary files from being committed.
2. Verify all sensitive keys (`PI_API_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`, `GOYE_ADMIN_SECRET`) are absent from git history.
3. Commit source code and push to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: production-ready GOYE Web3 Business Hub release"
   git remote add origin https://github.com/<your-username>/goye-web3-business-hub.git
   git push -u origin main
   ```

---

## Vercel Deployment Notes

This project is configured out-of-the-box for Vercel deployment with:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Serverless API Routes**: Handled via `api/index.ts` and configured in `vercel.json`
- **Client SPA Rewrites**: Configured so non-API routes serve `index.html`

### Deploying via Vercel CLI or Dashboard:

1. Import your GitHub repository in the [Vercel Dashboard](https://vercel.com/new).
2. Framework Preset: **Vite** (Vercel will detect `vercel.json` settings automatically).
3. Under **Environment Variables**, add:
   - `PI_NETWORK_MODE`: `TESTNET`
   - `PI_SANDBOX`: `false`
   - `PI_API_KEY`: *(your Pi developer API key)*
   - `PI_APP_ID`: *(your Pi application ID)*
   - `GEMINI_API_KEY`: *(your Google Gemini API key)*
   - `GOYE_ADMIN_SECRET`: *(your chosen admin secret)*
   - `DATABASE_URL`: *(PostgreSQL connection string if provisioned)*
4. Click **Deploy**.
5. Once deployed, verify your endpoints:
   - Frontend: `https://<your-project>.vercel.app`
   - Pi Status: `https://<your-project>.vercel.app/api/pi/status`
   - Health Check: `https://<your-project>.vercel.app/health`

---

## Truthful Database Status

If `DATABASE_URL` is unconfigured, the application runs on **development/intermediate persistence** and clearly reports:
`DATABASE PRODUCTION CREDENTIALS: NOT CONFIGURED (Using development/intermediate persistence; Cloud SQL / PostgreSQL required for multi-instance production)`

The 25 relational tables and schema definitions are maintained in `server/db/schema.sql` and `server/db/types.ts` for immediate migration to Cloud SQL / PostgreSQL when credentials are provisioned.

---

## License

Proprietary © 2026 GOYE Web3 Business Hub. All rights reserved.
