# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FutureSea.fun — a Web3 casino game (rocket crash game) on Solana. This is the **frontend only**; the backend runs separately at `localhost:3001`.

## Commands

```bash
yarn install        # Install dependencies
yarn dev            # Dev server at localhost:3000
yarn build          # Production build
yarn lint           # ESLint
```

No test runner is configured.

## Architecture

**Next.js 15 App Router** (React 19, TypeScript) with these key layers:

### Provider Stack (order matters)
`layout.tsx` → `Provider` → wraps everything in this nesting order:
1. `PrivyProvider` — Solana wallet auth via Privy.io
2. `HeroUIProvider` — UI component library (HeroUI, dark theme default)
3. `ContextProvider` — app-level contexts:
   - `SettingProvider` → `AuthProvider` → `UserDataProvider` → `WSProvider`

### Real-time Communication
- **WebSocket** (raw, not Socket.io) connects to `ws://localhost:3001` via `SocketContext.tsx`
- Auth token passed as query param; supports anonymous mode
- Auto-reconnect on disconnect (5s delay)
- Messages are typed: `chat` and `game` categories (see `src/types/socket.ts`)

### Game Engine
- **Phaser.js** renders the crash game visuals (`src/phaser/scenes/CrashScene.ts`)
- `CrashGame.tsx` (`src/app/engine/`) mounts the Phaser canvas
- `useGameController` hook controls game lifecycle: `startGame`, `triggerLaunch`, `triggerCrash`, `triggerEscape`

### API Routes (Next.js Route Handlers)
All under `src/app/api/` — these proxy to the backend at `NEXT_PUBLIC_API_URL`:
- `auth/profile` — user profile fetch
- `chat/messages` — chat history
- `game/crash/` — join, escape, validate, get, recent
- `profile/info`, `profile/avatar` — profile management

### HTTP Client
`src/utils/axios.ts` — Axios instance with base URL `/api`, auto-shows toast notifications on responses/errors via HeroUI's `addToast`.

### Key Contexts
- `AuthContext` — JWT + user state, login/logout, localStorage persistence
- `SocketContext` (WSProvider) — WebSocket connection + chat/game message state
- `ChatContext` — chat message management
- `userDataContext` — user profile data
- `modalContext` — modal visibility state
- `SettingContext` — app settings (e.g., offline mode via `OFFLINE` env var)

### Styling
- Tailwind CSS v4 + HeroUI (dark mode) + `tailwindcss-animation-delay` plugin
- Custom primary color palette (deep red `#8A0000`)
- Custom animations: `rotate-x-forever`, `flip-coin`, `float-cloud`
- Fonts: Geist Sans + Nova Square

### Pages
- `/` — home/landing
- `/crash` — main crash game
- `/coinflip` — coinflip game
- `/profile` — protected route (requires wallet auth)

## Environment Variables

Copy `env.example` to `.env.local`. Key variables:
- `NEXT_PUBLIC_API_URL` — backend API base URL
- `NEXT_PUBLIC_PRIVY_APP_ID` / `NEXT_PUBLIC_PRIVY_CLIENT_ID` — Privy auth
- `SOCKET_URL` — WebSocket server URL
- `NEXT_PUBLIC_SOLANA_NETWORK` / `NEXT_PUBLIC_SOLANA_RPC_URL` — Solana config
- `PINATA_JWT` / `PINATA_API_KEY` / `PINATA_API_SECRET` — IPFS uploads via Pinata
- `OFFLINE` — enable offline/mock mode

## Important Notes

- `reactStrictMode` is disabled in `next.config.ts`
- Solana packages (`@solana/web3.js`, `@solana/spl-token`) are externalized in webpack config
- The `hero.ts` file at project root exports the HeroUI plugin for Tailwind
- Package manager: **yarn** (yarn.lock present)
