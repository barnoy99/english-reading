/* firebase-config.js — cross-device progress sync.

   This deliberately points at the SAME Firebase project as
   Le-Francais-au-Quotidien. That project's security rules open only the
   `progress` subtree, so this app stores its data at `progress/abigailEnglish`,
   a sibling of the French app's `progress/user1` — separate keys, no collision,
   and no rules change needed. To move this app to its own project later,
   replace the values below and SYNC_PATH in sync.js; nothing else changes.

   Sync is optional: if this file is missing, or the Firebase SDK fails to
   load, the app runs on localStorage alone and nothing breaks. */

var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBEL3bYGB6oeGCNZ4hRzhNqa1yq_eUlgCc",
  authDomain: "francais-quotidien.firebaseapp.com",
  databaseURL: "https://francais-quotidien-default-rtdb.firebaseio.com",
  projectId: "francais-quotidien",
  storageBucket: "francais-quotidien.firebasestorage.app",
  messagingSenderId: "206900768255",
  appId: "1:206900768255:web:675ba102400c95d4f28bca"
};
