// auth.js — Firebase Authentication orchestrator
// Entry point for the entire SPA; controls auth overlay ↔ app shell

import { auth, DEMO_MODE } from './firebase-config.js';
import { initApp, teardownApp } from './app.js';
import { initFixtures, teardownFixtures } from './fixture.js';

// Only import Firebase Auth functions when not in demo mode
let GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile,
    onAuthStateChanged, signOut;

if (!DEMO_MODE) {
  const fbAuth = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js');
  ({ GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
     signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile,
     onAuthStateChanged, signOut } = fbAuth);
}

// --- DOM references ---
const authOverlay    = document.getElementById('auth-overlay');
const appShell       = document.getElementById('app');
const loadingOverlay = document.getElementById('loading-overlay');
const authError      = document.getElementById('auth-error');

// ========================================================
// DEMO MODE — bypass Firebase entirely, use localStorage
// ========================================================
const DEMO_USER = { uid: 'demo', displayName: 'Demo', email: null, photoURL: null };

async function enterDemoMode() {
  showLoading(true);
  authOverlay.classList.remove('active');
  appShell.classList.remove('hidden');
  showLoading(false);
  await Promise.all([initApp(DEMO_USER), initFixtures(DEMO_USER)]);
  // Show demo banner
  const banner = document.getElementById('demo-banner');
  if (banner) banner.classList.remove('hidden');
}

// ========================================================
// AUTH STATE OBSERVER — single entry point for the entire app
// ========================================================
if (DEMO_MODE) {
  // No Firebase — go straight to demo
  showLoading(false);
  await enterDemoMode();
} else {
  onAuthStateChanged(auth, async user => {
    showLoading(false);
    if (user) {
      authOverlay.classList.remove('active');
      appShell.classList.remove('hidden');
      const banner = document.getElementById('demo-banner');
      if (banner) banner.classList.add('hidden');
      await Promise.all([initApp(user), initFixtures(user)]);
    } else {
      authOverlay.classList.add('active');
      appShell.classList.add('hidden');
      teardownApp();
      teardownFixtures();
    }
  });
}

// ========================================================
// GOOGLE SIGN-IN
// ========================================================
async function signInWithGoogle() {
  clearError();
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showError(friendlyError(err.code));
    }
  }
}

// ========================================================
// EMAIL / PASSWORD — SIGN IN
// ========================================================
async function handleEmailSignIn(e) {
  e.preventDefault();
  clearError();
  const email    = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  try {
    showLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    showLoading(false);
    showError(friendlyError(err.code));
  }
}

// ========================================================
// EMAIL / PASSWORD — REGISTER
// ========================================================
async function handleEmailRegister(e) {
  e.preventDefault();
  clearError();
  const name     = document.getElementById('register-name').value.trim();
  const email    = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  if (password.length < 6) { showError('La contraseña debe tener al menos 6 caracteres.'); return; }
  try {
    showLoading(true);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
  } catch (err) {
    showLoading(false);
    showError(friendlyError(err.code));
  }
}

// ========================================================
// PASSWORD RESET
// ========================================================
async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value.trim();
  if (!email) { showError('Escribe tu email arriba primero.'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    showError('¡Email enviado! Revisa tu bandeja de entrada.', 'success');
  } catch (err) {
    showError(friendlyError(err.code));
  }
}

// ========================================================
// SIGN OUT
// ========================================================
async function handleSignOut() {
  try { await signOut(auth); } catch (err) { console.error('Sign-out error:', err); }
}

// ========================================================
// AUTH TABS (Sign In ↔ Register)
// ========================================================
function initAuthTabs() {
  document.querySelectorAll('[data-auth-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.authTab;
      document.querySelectorAll('[data-auth-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('[data-auth-panel]').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.querySelector(`[data-auth-panel="${tab}"]`);
      if (panel) panel.classList.add('active');
      clearError();
    });
  });
}

// ========================================================
// UI HELPERS
// ========================================================
function showError(msg, type = 'error') {
  authError.textContent = msg;
  authError.className = `auth-error ${type}`;
  authError.style.display = 'block';
}
function clearError() {
  authError.style.display = 'none';
  authError.textContent = '';
}
function showLoading(show) {
  loadingOverlay.classList.toggle('hidden', !show);
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':         'No existe una cuenta con ese email.',
    'auth/wrong-password':         'Contraseña incorrecta.',
    'auth/invalid-credential':     'Email o contraseña incorrectos.',
    'auth/email-already-in-use':   'Ya existe una cuenta con ese email.',
    'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email':          'El email no es válido.',
    'auth/too-many-requests':      'Demasiados intentos. Intenta de nuevo más tarde.',
    'auth/network-request-failed': 'Error de red. Verifica tu conexión.',
    'auth/popup-blocked':          'El popup fue bloqueado. Permite popups para este sitio.',
  };
  return map[code] || 'Ocurrió un error. Por favor intenta de nuevo.';
}

// ========================================================
// WIRE UP ALL AUTH EVENTS
// ========================================================
if (!DEMO_MODE) {
  document.getElementById('google-signin-btn')?.addEventListener('click',   signInWithGoogle);
  document.getElementById('google-register-btn')?.addEventListener('click', signInWithGoogle);
  document.getElementById('email-signin-form')?.addEventListener('submit',  handleEmailSignIn);
  document.getElementById('email-register-form')?.addEventListener('submit', handleEmailRegister);
  document.getElementById('forgot-password-link')?.addEventListener('click', handleForgotPassword);
  initAuthTabs();
}

// Sign-out: always wired, behavior differs by mode
document.getElementById('signout-btn')?.addEventListener('click', () => {
  if (DEMO_MODE) { location.reload(); } else { handleSignOut(); }
});

// "Probar sin cuenta" button
document.getElementById('try-demo-btn')?.addEventListener('click', enterDemoMode);

export { handleSignOut };
