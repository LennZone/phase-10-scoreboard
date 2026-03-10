import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Copy your Firebase config from the Firebase Console.
// In .env (for local dev) or GitHub Actions secrets (for CI/CD).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Required Firestore security rules (set in Firebase Console):
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /games/{gameId} {
//       allow read: if true;
//       allow create: if request.auth != null;
//       allow delete: if request.auth != null && resource.data.hostUid == request.auth.uid;
//       allow update: if request.auth != null && (
//         // Host kann alles
//         resource.data.hostUid == request.auth.uid ||
//         // Spieler können in der Lobby beitreten (players, playerState, participants)
//         (resource.data.status == 'lobby' &&
//          request.resource.data.diff(resource.data).affectedKeys()
//            .hasOnly(['players', 'playerState', 'participants'])) ||
//         // Spieler können ihre eigene Punkteeingabe einreichen
//         (resource.data.status == 'active' &&
//          request.resource.data.diff(resource.data).affectedKeys()
//            .hasOnly(['pendingSubmissions']))
//       );
//     }
//   }
// }
//
// Firestore TTL (automatische Löschung anonymer Spiele nach 24h):
// Firebase Console → Firestore → TTL-Richtlinien → Neue Richtlinie
//   Collection: games  |  Feld: ttl
