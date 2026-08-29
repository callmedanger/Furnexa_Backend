const db = require('../config/firebase');
const COLLECTION = 'Designers';

const getAllDesigners = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const designers = [];
  snapshot.forEach((doc) => designers.push({ id: doc.id, ...doc.data() }));
  return designers;
};

const createDesigner = async (data) => {
  const docRef = await db.collection(COLLECTION).add({
    name: data.name,
    email: data.email,
    specialty: data.specialty || '',
    rating: data.rating || 0,
    photo: data.photo || null,
    isAvailable: data.isAvailable ?? true,
    createdAt: new Date(),
  });
  return { id: docRef.id, ...data };
};

const updateAvailability = async (id, isAvailable) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  await db.collection(COLLECTION).doc(id).update({ isAvailable });
  return { id, isAvailable };
};

const deleteDesigner = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return false;
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

module.exports = { getAllDesigners, createDesigner, updateAvailability, deleteDesigner };