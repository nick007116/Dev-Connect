const admin = require('firebase-admin');

const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

module.exports = { verifyToken };