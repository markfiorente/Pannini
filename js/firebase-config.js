// ============================================================
// FIREBASE CONFIGURATION — MarkFiorente World Cup 2026 Tracker
// ============================================================
// Setup steps:
// 1. Go to https://console.firebase.google.com
// 2. Create a project → Add web app → copy the config object below
// 3. Enable Authentication → Sign-in methods:
//    ✓ Google
//    ✓ Email/Password
// 4. Enable Firestore Database (start in production mode)
// 5. In Firestore Rules, paste:
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /users/{uid}/{document=**} {
//          allow read, write: if request.auth != null && request.auth.uid == uid;
//        }
//      }
//    }
// 6. In Authentication → Settings → Authorized domains, add your domain
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// *** REPLACE WITH YOUR FIREBASE PROJECT CREDENTIALS ***
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// If credentials are still placeholder, run in demo mode (localStorage only)
export const DEMO_MODE = firebaseConfig.apiKey === 'YOUR_API_KEY';

let auth = null;
let db   = null;

if (!DEMO_MODE) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getFirestore(app);

  enableIndexedDbPersistence(db).catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firebase] Offline persistence unavailable: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('[Firebase] Offline persistence not supported in this browser');
    }
  });
} else {
  console.info('[MarkFiorente] Modo Demo activo — los datos se guardan en localStorage.');
}

export { auth, db };
