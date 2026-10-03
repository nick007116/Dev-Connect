import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  where, 
  getDocs, 
  updateDoc, 
  limit, 
  startAfter, 
  serverTimestamp, 
  deleteDoc,
  arrayUnion, // Add this import
  arrayRemove // Might be useful as well
} from "firebase/firestore";
import { getDatabase, ref, onValue, set, onDisconnect, remove } from "firebase/database"; // Import Realtime Database functions

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const rtdb = app ? getDatabase(app) : null;

export { 
  auth, db, rtdb, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  doc, getDoc, setDoc, collection, addDoc, query, onSnapshot, orderBy, 
  where, getDocs, updateDoc, limit, startAfter, serverTimestamp, deleteDoc, 
  ref, onValue, set, onDisconnect, remove, arrayUnion, arrayRemove
};