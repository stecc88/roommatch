# RoomMatch – Documentazione (IT)

## Panoramica
- RoomMatch è una piattaforma per cercare/compartire appartamenti in modo semplice e moderno.
- Include scoperta profili con swipe, sistema di “match”, chat in tempo reale e gestione di annunci.
- Architettura full‑stack: Frontend (React + Vite) e Backend (Express + Prisma), autenticazione JWT.

## Architettura
- Frontend: React 18, Vite, React Query, React Router, Axios, Framer Motion, Socket.IO client, Tailwind CSS.
- Backend: Express, Socket.IO server, Prisma ORM, JWT (jsonwebtoken), bcryptjs, Multer per upload.
- Comunicazione:
  - HTTP REST per la maggior parte delle funzionalità.
  - WebSocket (Socket.IO) per eventi in tempo reale (messaggi, like, notifiche).

## Dipendenze principali
- Frontend:
  - `react-query` per fetching e cache dei dati.
  - `axios` per richieste HTTP con intercettori (token e error handling).
  - `react-router-dom` per routing pubblico/privato.
  - `react-hook-form` per form performanti (wizard di registrazione).
  - `framer-motion` per animazioni e gesture (es. swipe).
  - `socket.io-client` per tempo reale.
  - `@heroicons/react` per icone.
- Backend:
  - `express` per API REST.
  - `socket.io` per canale WS.
  - `@prisma/client` + `prisma` per accesso DB tipato.
  - `bcryptjs` per hashing password.
  - `jsonwebtoken` per autenticazione JWT.
  - `multer` per upload di foto.
  - `cors` per gestione degli origini.

## Struttura cartelle
- `frontend/`
  - `src/App.jsx`: configura Router, React Query, i18n e Auth.
  - `src/contexts/AuthContext.jsx`: gestione sessione (login, register, logout, checkAuth).
  - `src/api/*`: layer API con Axios (auth, matches, listings, chat).
  - `src/hooks/useSocket.js`: connessione Socket.IO e sincronizzazione cache.
  - `src/pages/*`: pagine funzionali (Login, Register, Discover, Matches, Rooms, ListingDetail, Chat, Profile).
  - `src/components/layout/*`: layout comune (Navbar, Sidebar, MobileNav, MainLayout).
  - `src/components/common/*`: componenti condivisi (ProtectedRoute, LoadingScreen, EmptyState).
  - `vite.config.js`: configurazione Vite (proxy dev verso backend).
  - `dist/`: output di produzione generato da `npm run build` (non si committa normalmente).
- `backend/`
  - `src/server.js`: entrypoint del server HTTP (porta di default 3000 in sviluppo).
  - `src/app.js`: Express + Socket.IO, CORS e mount delle routes.
  - `src/prisma/client.js`: istanza Prisma condivisa.
  - `src/middleware/auth.middleware.js`: verifica JWT e allega `req.user`.
  - `src/controllers/*.js`: logica di dominio (auth, user, match, listing, chat).
  - `src/routes/*.js`: definizione delle risorse REST.

## Setup e avvio
1. Installazione dipendenze:
   - `cd frontend && npm install`
   - `cd ../backend && npm install`
2. Variabili di ambiente:
   - Backend: `.env` con almeno `JWT_SECRET`, credenziali DB (es. `DATABASE_URL`), e se necessario `FRONTEND_URL`.
   - Frontend: opzionale `VITE_API_URL` (per cambiare `baseURL` di Axios). In sviluppo si usa il proxy di Vite.
3. Avvio in sviluppo:
   - Backend: `npm run dev` (porta `3000`).
   - Frontend: `npm run dev` (porta `5173`).
   - Assicurati che il proxy di Vite (`vite.config.js`) punti al backend (di default `http://localhost:3000`).

## Build e deploy
- Frontend:
  - `npm run build` genera `frontend/dist/` con `index.html` e bundle minificati in `assets/`.
  - In produzione si serve `dist/` da un server statico/hosting (CDN). Non è necessario committare `dist` su Git.
- Backend:
  - Deploy come servizio Node (PM2, Docker, PaaS). Impostare variabili `.env` e collegamento DB.

## Flussi principali
- Autenticazione:
  - Login invia credenziali a `/auth/login`; al successo salva `token` e carica profilo (`/users`).
  - Register è multi‑step: invia `FormData` con foto e preferenze a `/auth/register`.
  - Intercettori Axios gestiscono 401/404 (logout e redirect).
- Discover & Matches:
  - `GET /discover` per profili; swipe con Framer Motion; `POST /matches/like` per like e match.
- Chat:
  - REST per listing conversazioni/messaggi e Socket.IO per aggiornamenti live.
- Listings:
  - CRUD annuncio, preferiti, filtri di ricerca e dettagli.

## Scelte progettuali
- `react-query` per ridurre boilerplate e ottenere caching/invalidazione.
- `react-hook-form` per gestire form complessi con alte prestazioni.
- `framer-motion` per UX moderna e fluida.
- `prisma` per sicurezza dei tipi, facilità di query e migrazioni.
- `JWT` per autenticazione stateless, semplice da scalare.

## FAQ
- Perché c’è la cartella `dist/` nel frontend?
  - È l’output di produzione generato dal build; in sviluppo non si usa. Si rigenera al bisogno e in genere si ignora su Git (`.gitignore`).
- Posso usare account demo?
  - Sì: nella schermata Login ci sono pulsanti per precompilare credenziali demo (es. `owner1@demo.com`, `seeker1@demo.com`, password `password123`).
- Posso cambiare le porte?
  - Sì. Di default: backend `3000`, frontend dev `5173`. Aggiorna il proxy di Vite se modifichi la porta backend.

## Comandi utili
- Frontend:
  - `npm run dev`: sviluppo con Vite.
  - `npm run build`: build di produzione (genera `dist/`).
- Backend:
  - `npm run dev`: avvio sviluppo (nodemon/ts-node a seconda della config).

## Note di sicurezza
- Non committare segreti (`JWT_SECRET`, credenziali DB) nel repository.
- Valida sempre gli input lato server, specialmente durante la registrazione.

## Presentazione rapida (slide‑ready)
- Problema: trovare coinquilini o condividere appartamenti con UX fluida e affidabile.
- Soluzione: React + Vite (client), Express + Prisma (server), JWT, React Query, Socket.IO.
- Demo flussi:
  - Registrazione multi‑step con foto e preferenze.
  - Scoperta profili con swipe e compatibilità.
  - Match e chat in tempo reale.
  - Annunci, preferiti e filtri.
- Valore: architettura chiara, performance, caching dati, tempo reale, facile estensione.

## API Endpoints principali
- Autenticazione
  - `POST /auth/login` – login, ritorna JWT e user info.
  - `POST /auth/register` – registrazione (supporta `FormData` per foto).
  - `POST /auth/forgot-password` – invio token di reset (mock in dev).
  - `POST /auth/reset-password` – reset password con token.
  - `POST /auth/logout` – logout (stateless, lato client).
- Utente
  - `GET /users` – profilo dell’utente autenticato.
  - `PUT /users` – aggiornamento profilo (supporta `FormData` se necessario).
- Discover & Match
  - `GET /discover` – profili suggeriti.
  - `GET /matches` – lista match.
  - `POST /matches/like` – like a un profilo; se reciproco diventa match.
  - `GET /matches/incoming` – like ricevuti.
  - `GET /matches/outgoing` – like inviati.
- Listings
  - `GET /listings` – elenco annunci con filtri.
  - `POST /listings` – crea annuncio.
  - `GET /listings/:id` – dettaglio annuncio.
  - `PUT /listings/:id` – aggiorna annuncio.
  - `DELETE /listings/:id` – elimina annuncio.
  - `POST /listings/:id/favorite` – toggle preferito.
  - `GET /listings/favorites` – preferiti dell’utente.
- Chat
  - `GET /chat/conversations` – conversazioni.
  - `GET /chat/messages/:conversationId` – messaggi.
  - `POST /chat/messages` – invia messaggio.
  - `POST /chat/read/:conversationId` – marca come letto.
- Socket.IO
  - `GET /socket.io` – handshake WS (proxy in dev); eventi: nuovi messaggi, like/match.

## Diagramma concettuale (testuale)
- Client React → Axios/React Query → API REST (Express) → Prisma → DB
- Client React ↔ Socket.IO Client ↔ Socket.IO Server → eventi (messaggi, like)
- Auth: JWT nel client (localStorage) e `Authorization: Bearer` agli endpoint protetti

## Script di presentazione (5–7 minuti)
1. Introduzione problema e valore dell’app.
2. Architettura a strati: frontend, backend, DB, tempo reale.
3. Login e registrazione: validazioni lato server, gestione token.
4. Discover: swipe e calcolo compatibilità (età, interessi, lingue, stile di vita).
5. Matches e Chat: reattività con Socket.IO e aggiornamento cache.
6. Listings: CRUD, preferiti e filtri.
7. Conclusione: motivazioni tecniche e scalabilità.

## Setup demo rapido
- Backend: `npm run dev` su porta `3000`.
- Frontend: `npm run dev` su `5173` con proxy verso backend.
- Login demo: pulsanti nella pagina Login compilano `owner1@demo.com` / `seeker1@demo.com` (password `password123`).

