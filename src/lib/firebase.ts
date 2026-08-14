import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC5L-xmAFxZ4sywV4dF0HIcJuvMT8EoxT8",
  authDomain: "businesshub-9bef1.firebaseapp.com",
  projectId: "businesshub-9bef1",
  storageBucket: "businesshub-9bef1.firebasestorage.app",
  messagingSenderId: "40109772498",
  appId: "1:40109772498:web:5a35b4433aebae1a73670b",
  measurementId: "G-2D7H2RKKZ1"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
