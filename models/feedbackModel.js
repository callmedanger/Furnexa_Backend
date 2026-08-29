const db = require('../config/firebase');
const COLLECTION = 'Feedback';

const getAllFeedbacks = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const feedbacks = [];
  snapshot.forEach(doc => feedbacks.push({ id: doc.id, ...doc.data() }));
  return feedbacks;
};

const getFeedbackById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

module.exports = { getAllFeedbacks, getFeedbackById };