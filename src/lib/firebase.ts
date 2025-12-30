import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration (publishable keys - safe for client-side)
const firebaseConfig = {
  apiKey: "AIzaSyB0i01XuUbdEeSmg45PumZJwuyU1Iyrf7Q",
  authDomain: "d4desi-69c02.firebaseapp.com",
  projectId: "d4desi-69c02",
  storageBucket: "d4desi-69c02.firebasestorage.app",
  messagingSenderId: "40942035138",
  appId: "1:40942035138:web:9f1cbaa8f6b741c3089b5b",
  measurementId: "G-8DNXKNWFN0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const initAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
