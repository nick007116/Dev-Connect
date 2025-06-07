// filepath: /n:/MajorProjects/devconnect/backend/services/firebaseService.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp;
let database;


const initializeFirebaseAdmin = () => {
  if (!firebaseApp) {
    try {
      // Use service account JSON file
      const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');
      
      // Check if service account file exists
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`
        });
        
        console.log('Firebase Admin initialized successfully with service account');
      } else {
        throw new Error('Firebase service account file not found at: ' + serviceAccountPath);
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error.message);
      throw error;
    }
  }
  return firebaseApp;
};

const getFirebaseDatabase = () => {
  if (!database) {
    initializeFirebaseAdmin();
    database = admin.database();
  }
  return database;
};

const getFirestore = () => {
  initializeFirebaseAdmin();
  return admin.firestore();
};

module.exports = {
  initializeFirebaseAdmin,
  getFirebaseDatabase,
  getFirestore
};