import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "prepai-79288.firebaseapp.com",
  projectId: "prepai-79288",
  storageBucket: "prepai-79288.firebasestorage.app",
  messagingSenderId: "160574468056",
  appId: "1:160574468056:web:091048dde968396dcb8cad"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };