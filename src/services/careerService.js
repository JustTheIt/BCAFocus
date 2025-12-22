import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const CAREER_RESOURCES_COLLECTION = 'careerResources';

/**
 * Get all career resources (Admin + Student)
 */
export const getCareerResources = async () => {
    try {
        const q = query(collection(db, CAREER_RESOURCES_COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { throw error; }
};

/**
 * Add Career Resource (Admin)
 */
export const addCareerResource = async (resourceData) => {
    try {
        const docRef = await addDoc(collection(db, CAREER_RESOURCES_COLLECTION), {
            ...resourceData,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...resourceData };
    } catch (error) { throw error; }
};

/**
 * Update Career Resource (Admin)
 */
export const updateCareerResource = async (resourceId, resourceData) => {
    try {
        const docRef = doc(db, CAREER_RESOURCES_COLLECTION, resourceId);
        await updateDoc(docRef, {
            ...resourceData,
            updatedAt: serverTimestamp()
        });
    } catch (error) { throw error; }
};

/**
 * Delete Career Resource (Admin)
 */
export const deleteCareerResource = async (resourceId) => {
    try {
        await deleteDoc(doc(db, CAREER_RESOURCES_COLLECTION, resourceId));
    } catch (error) { throw error; }
};
