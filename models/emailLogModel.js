const db = require('../config/firebase');
const COLLECTION = 'emailLogs';

const createLog = async (data) => {
  const docRef = await db.collection(COLLECTION).add({
    recipients: data.recipients,
    subject: data.subject,
    message: data.message,
    successCount: data.successCount,
    failCount: data.failCount,
    sentAt: new Date(),
  });
  return { id: docRef.id, ...data };
};

const getAllLogs = async () => {
  const snapshot = await db.collection(COLLECTION).orderBy('sentAt', 'desc').get();
  const logs = [];
  snapshot.forEach((doc) => logs.push({ id: doc.id, ...doc.data() }));
  return logs;
};

module.exports = { createLog, getAllLogs };