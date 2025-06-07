# CLAUDE.md

必ず日本語で回答してください。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start both server and client in development mode (uses npm-run-all)
- `npm run dev:server` - Start only the server with nodemon
- `npm run dev:client` - Start only the client with Vite
- `npm run build` - Build the project (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm start` - Start production server

## Architecture

This is a real-time multiplayer board game platform focused on Mancala, built with:

**Frontend (React + TypeScript)**

- Uses React Router for navigation between game states
- Socket.io-client for real-time game communication
- CSS modules for styling (separate CSS files for each component)

**Backend (Node.js ESM)**

- Express server serving the built frontend from `dist/`
- Socket.io for real-time multiplayer functionality
- MongoDB with Mongoose for game state persistence
- API routes under `/api` prefix

**Key Game Flow**

1. Home page → Create/Join room
2. Waiting room → Wait for second player
3. Game page → Real-time Mancala gameplay

**Socket Events Architecture**

- Server manages room-based game sessions
- Real-time updates for game state, player moves, and room status
- All socket logic is in `server/socket/` directory

**Database Models**

- Room model stores game state, player info, and settings
- Games are temporary and cleaned up after completion

**File Structure Notes**

- Server uses `.mjs` extensions for ES modules
- Frontend components follow standard React patterns
- CSS is organized by page/component in `src/css/`
- Game logic is split between client (UI) and server (validation)
