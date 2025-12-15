// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCBgcl8j_uJDVMpcNFEQvW-EqnshPiW2n8",
  authDomain: "tomyhomeapp-b7bf1.firebaseapp.com",
  projectId: "tomyhomeapp-b7bf1",
  storageBucket: "tomyhomeapp-b7bf1.firebasestorage.app",
  messagingSenderId: "1034110443870",
  appId: "1:1034110443870:web:1aa986bfe6fdf770e62fcf",
  measurementId: "G-Y5P06F4581"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Eksportowane instancje
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;