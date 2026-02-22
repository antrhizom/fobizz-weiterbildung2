import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Dieselbe Firebase-Datenbank wie to-teach-edu → Codes funktionieren in beiden Apps
const firebaseConfig = {
  apiKey: "AIzaSyACZvcT_03XaWKP0qKrZFZoIKILx5-lZps",
  authDomain: "toteach-edu.firebaseapp.com",
  projectId: "toteach-edu",
  storageBucket: "toteach-edu.firebasestorage.app",
  messagingSenderId: "551338168510",
  appId: "1:551338168510:web:6007104d08bf00959d4eef"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
