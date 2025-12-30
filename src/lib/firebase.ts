import { useEffect, useState } from "react";
import { firebaseConfig } from "./firebase-config";

// Lazy initialization to avoid build issues with Firebase types
let firebaseApp: ReturnType<typeof import("firebase/app").initializeApp> | null = null;

export const getFirebaseApp = async () => {
  if (!firebaseApp) {
    const { initializeApp } = await import("firebase/app");
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
};

export const getFirebaseAuth = async () => {
  const app = await getFirebaseApp();
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
};

export const getFirebaseDb = async () => {
  const app = await getFirebaseApp();
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
};

export const getFirebaseStorage = async () => {
  const app = await getFirebaseApp();
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
};

// Hook for using Firebase Auth
export const useFirebaseAuth = () => {
  const [auth, setAuth] = useState<Awaited<ReturnType<typeof getFirebaseAuth>> | null>(null);
  
  useEffect(() => {
    getFirebaseAuth().then(setAuth);
  }, []);
  
  return auth;
};

// Hook for using Firestore
export const useFirestore = () => {
  const [db, setDb] = useState<Awaited<ReturnType<typeof getFirebaseDb>> | null>(null);
  
  useEffect(() => {
    getFirebaseDb().then(setDb);
  }, []);
  
  return db;
};
