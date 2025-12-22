import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// REPLACE WITH YOUR FIREBASE CONFIG
// Go to: https://console.firebase.google.com
// Project Settings > General > Your apps > SDK setup and configuration
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

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Get database instance
const database = getDatabase(app);

// IMPORTANT: For development, you can use emulator
// Uncomment this if testing locally:
// if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
//   connectDatabaseEmulator(database, 'localhost', 9000);
// }

export { app, database };
