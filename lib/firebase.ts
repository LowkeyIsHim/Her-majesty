import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Replace with your Firebase config
// Go to: https://console.firebase.google.com
// Create project > Web App > Copy config
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

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const database = getDatabase(app);

export { app, database };
