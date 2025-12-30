// lib/firebase.ts - Fixed with proper types

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCOe1XPyNb7bgSMb8_euugghjdZBZiXwps",
  authDomain: "her-majesty-1bb7e.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "her-majesty-1bb7e",
  storageBucket: "her-majesty-1bb7e.firebasestorage.app",
  messagingSenderId: "923373911468",
  appId: "1:923373911468:web:8357bf8b93b5819a478e09",
  measurementId: "G-EH84BE625R"
};

let app: FirebaseApp;
let database: Database;

if (typeof window !== 'undefined') {
  // Only initialize on client side
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  database = getDatabase(app);
}

export { database };
