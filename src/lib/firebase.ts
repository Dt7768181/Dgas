// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ20QKKsfwDSejL_zM1if5-S2ITX8xxnM",
  authDomain: "dgas-48b35.firebaseapp.com",
  projectId: "dgas-48b35",
  storageBucket: "dgas-48b35.appspot.com",
  messagingSenderId: "550903278037",
  appId: "1:550903278037:web:5a84e7cdcd96138a5df55c"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
