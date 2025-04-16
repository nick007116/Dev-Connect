// filepath: /n:/MajorProjects/devconnect/backend/services/firebaseService.js
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-sdk.json');

const initializeFirebaseAdmin = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL // Make sure this is in your .env
  });
};

const getFirebaseDatabase = () => {
  return admin.database();
};

module.exports = { initializeFirebaseAdmin, getFirebaseDatabase };