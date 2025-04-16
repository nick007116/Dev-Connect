import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, onSnapshot, orderBy, where, getDocs, updateDoc, limit, startAfter, serverTimestamp } from "firebase/firestore";
import { getDatabase, ref, onValue, set, onDisconnect, remove } from "firebase/database"; // Import Realtime Database functions

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); // Get Realtime Database instance

export { auth, db, rtdb, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, doc, getDoc, setDoc, collection, addDoc, query, onSnapshot, orderBy, where, getDocs, updateDoc, limit, startAfter, serverTimestamp, ref, onValue, set, onDisconnect, remove };