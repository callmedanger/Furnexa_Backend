const db = require('../config/firebase');
const COLLECTION = 'Feedback';

const getAllFeedbacks = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const feedbacks = [];
  snapshot.forEach((doc) => feedbacks.push({ id: doc.id, ...doc.data() }));
  return feedbacks;
};

const getFeedbackById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const addReply = async (id, replyMessage) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;

  const existing = doc.data();
  const replies = Array.isArray(existing.replies) ? existing.replies : [];
  const newReply = { message: replyMessage, sentAt: new Date() };

  await db.collection(COLLECTION).doc(id).update({
    replies: [...replies, newReply],
    status: 'replied',
    lastRepliedAt: new Date(),
  });

  const updatedDoc = await db.collection(COLLECTION).doc(id).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

const saveAnalysis = async (id, sentiment, suggestedReply) => {
  await db.collection(COLLECTION).doc(id).update({
    sentiment,
    suggestedReply,
    analyzedAt: new Date(),
  });
  const doc = await db.collection(COLLECTION).doc(id).get();
  return { id: doc.id, ...doc.data() };
};

module.exports = { getAllFeedbacks, getFeedbackById, addReply, saveAnalysis };