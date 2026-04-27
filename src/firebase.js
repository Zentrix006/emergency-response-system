import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5UlcaFpYOWsUJOVnC6hsslh6Pxdj15qA",
  authDomain: "emergency-system-f0a1a.firebaseapp.com",
  projectId: "emergency-system-f0a1a",
  storageBucket: "emergency-system-f0a1a.firebasestorage.app",
  messagingSenderId: "681240841684",
  appId: "1:681240841684:web:c60360a6af4ea784cada41",
  measurementId: "G-L51B0SZS3T",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;