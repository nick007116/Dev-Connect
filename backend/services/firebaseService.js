// filepath: /n:/MajorProjects/devconnect/backend/services/firebaseService.js
const admin = require('firebase-admin');

let firebaseApp;

const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      let serviceAccount;
      
      // For production (Vercel), use environment variables
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
          throw new Error('Missing required Firebase environment variables for production');
        }
        
        serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
          universe_domain: "googleapis.com"
        };
      } else {
        // For local development, use service account file
        const path = require('path');
        const configPath = path.join(__dirname, '../config/firebase-service-account.json');
        serviceAccount = require(configPath);
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });

      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error.message);
      throw error;
    }
  }
  return firebaseApp;
};

const getFirestore = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
};

module.exports = {
  initializeFirebaseAdmin,
  getFirestore
};