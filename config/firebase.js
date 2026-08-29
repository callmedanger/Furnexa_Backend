const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(decoded);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

module.exports = db;