import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Eigenes Firebase-Projekt für fobizz-Weiterbildung (getrennt von to-teach-edu)
const firebaseConfig = {
  apiKey: "AIzaSyAO87M2lwGKGVNwd81lpNzafaNk7X-INqc",
  authDomain: "wbdlh-fobizz.firebaseapp.com",
  projectId: "wbdlh-fobizz",
  storageBucket: "wbdlh-fobizz.firebasestorage.app",
  messagingSenderId: "621619661633",
  appId: "1:621619661633:web:8e154186713e5a9467afc0"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
