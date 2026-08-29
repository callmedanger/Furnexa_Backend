const db = require('../config/firebase');
const COLLECTION = 'users';
const ROLE = 'rider';

const getAllRiders = async () => {
  const snapshot = await db.collection(COLLECTION).where('role', '==', ROLE).get();
  const riders = [];
  snapshot.forEach((doc) => riders.push({ id: doc.id, ...doc.data() }));
  return riders;
};

const createRider = async (data) => {
  const docRef = await db.collection(COLLECTION).add({
    name: data.name,
    email: data.email,
    role: ROLE,
    isAvailable: data.isAvailable ?? true,
    riderpic: data.riderpic || null,
    createdAt: new Date(),
  });
  return { id: docRef.id, ...data, role: ROLE };
};

const updateAvailability = async (id, isAvailable) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  await db.collection(COLLECTION).doc(id).update({ isAvailable });
  return { id, isAvailable };
};

const deleteRider = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return false;
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

module.exports = { getAllRiders, createRider, updateAvailability, deleteRider };