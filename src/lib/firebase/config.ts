import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración con tus credenciales reales
const firebaseConfig = {
  apiKey: "AIzaSyAhEwDCedV_COlPqrWRhxh3r9Nk0vZhaA8",
  authDomain: "chifa-los-angeles-4.firebaseapp.com",
  projectId: "chifa-los-angeles-4",
  storageBucket: "chifa-los-angeles-4.firebasestorage.app",
  messagingSenderId: "138335815578",
  appId: "1:138335815578:web:e523d67d2741f0be489c23"
};

// Inicializar Firebase solo si no está inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };