const db = require('../config/firebase');
const COLLECTION = 'Orders';

const getAllOrders = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const orders = [];
  snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
  return orders;
};

const getOrderById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

module.exports = { getAllOrders, getOrderById };