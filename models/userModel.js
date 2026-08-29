const db = require('../config/firebase');
const COLLECTION = 'users';

const getAllUsers = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const users = [];
  snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
  return users;
};

const getUserById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const deleteUser = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return false;
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

module.exports = { getAllUsers, getUserById, deleteUser };