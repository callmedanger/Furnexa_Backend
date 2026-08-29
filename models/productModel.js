const db = require('../config/firebase');
const COLLECTION = 'OurBooks';

const getAllProducts = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const products = [];
  snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
  return products;
};

const getProductById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const deleteProduct = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return false;
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

module.exports = { getAllProducts, getProductById, deleteProduct };