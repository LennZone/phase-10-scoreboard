# Phase 10 Scoreboard

A real-time digital scoreboard for the card game Phase 10. Replaces pen and paper with automatic phase tracking, live score sync across all players' devices, and a game history tied to your Google account.

![Version](https://img.shields.io/github/package-json/v/LennZone/phase-10-score-tracker) ![License](https://img.shields.io/badge/license-MIT-blue) ![Deploy](https://img.shields.io/badge/deployed-GitHub%20Pages-green)

**Live:** [lennzone.github.io/phase-10-score-tracker](https://lennzone.github.io/phase-10-score-tracker/)

---

## Features

- **Real-time sync** — all players see scores and phase progress instantly
- **No account required to play** — guests join via invite link, no sign-up needed
- **Automatic phase completion** — phases are marked complete automatically when points < 50
- **Game history** — sign in with Google to save and revisit past games
- **Host controls** — edit any player's score from the round history
- **Mobile-first** — optimized for phones with large touch targets
- **Animated scoreboard** — ranking changes animate smoothly in real time

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Backend | [Firebase Firestore](https://firebase.google.com/docs/firestore) (real-time DB) |
| Auth | [Firebase Anonymous Auth](https://firebase.google.com/docs/auth/web/anonymous-auth) + Google Sign-In |
| Routing | [React Router v6](https://reactrouter.com/) (HashRouter) |
| Dev Environment | [Docker](https://www.docker.com/) |
| Deployment | [GitHub Pages](https://pages.github.com/) via GitHub Actions |
| Code Quality | Prettier + Husky + lint-staged |
| Versioning | [Conventional Commits](https://www.conventionalcommits.org/) + Release Please |

---

## Local Development

### Prerequisites

- [Docker](https://www.docker.com/) installed and running
- A Firebase project (see [Firebase Setup](#firebase-setup) below)

### 1. Clone the repository

```bash
git clone https://github.com/LennZone/phase-10-score-tracker.git
cd phase-10-score-tracker
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 3. Start the dev server

```bash
docker compose down && docker compose build && docker compose up
```

App is available at **http://localhost:5176** with hot reload. No local Node.js installation required — `node_modules` live inside the container.

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Register a **Web App** and copy the config values into `.env`
3. Enable **Anonymous Authentication** (Authentication → Sign-in method → Anonymous)
4. Enable **Google Authentication** (Authentication → Sign-in method → Google)
5. Create a **Firestore Database** (production mode)
6. Add `localhost` to **Authorized Domains** (Authentication → Settings)
7. Apply the security rules below

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && resource.data.hostUid == request.auth.uid;
      allow update: if request.auth != null && (
        resource.data.hostUid == request.auth.uid ||
        (resource.data.status == 'lobby' &&
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['players', 'playerState', 'participants'])) ||
        (resource.data.status == 'active' &&
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['pendingSubmissions']))
      );
    }
  }
}
```

### Automatic Cleanup (TTL)

Anonymous games are automatically deleted after 24 hours via a Firestore TTL policy. Set it up once with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase firestore:ttl:set games ttl --project YOUR_PROJECT_ID
```

---

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via GitHub Actions.

### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### GitHub Pages Configuration

**Settings → Pages → Source:** `GitHub Actions`

Add your production domain to Firebase Authorized Domains:
`lennzone.github.io`

---

## License

MIT © [LennZone](https://github.com/LennZone)
