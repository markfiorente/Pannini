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

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Enable offline persistence — data survives without internet
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('[Firebase] Offline persistence unavailable: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firebase] Offline persistence not supported in this browser');
  }
});

export { auth, db };
