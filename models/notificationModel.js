const db = require('../config/firebase');
const COLLECTION = 'notifications';

const getAllNotifications = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const notifications = [];
  snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));
  return notifications;
};

const getNotificationById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

module.exports = { getAllNotifications, getNotificationById };