import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

const MATERIALS_COLLECTION = 'materials';

// Upload material (Admin only)
export const uploadMaterial = async (materialData) => {
    try {
        const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), {
            ...materialData,
            uploadedAt: serverTimestamp()
        });
        return { id: docRef.id, ...materialData };
    } catch (error) {
        throw error;
    }
};

// Get materials for a specific subject (Student/Admin)
export const getMaterials = async (subjectId, isAdmin = false) => {
    try {
        let q = collection(db, MATERIALS_COLLECTION);

        if (subjectId !== 'all') {
            q = query(q, where('subjectId', '==', subjectId));
        }

        // Students only see visible materials
        if (!isAdmin) {
            q = query(q, where('visible', '==', true));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw error;
    }
};

// Delete material (Admin only)
export const deleteMaterial = async (materialId) => {
    try {
        await deleteDoc(doc(db, MATERIALS_COLLECTION, materialId));
    } catch (error) {
        throw error;
    }
};

// Record material view (Student tracking)
export const recordMaterialView = async (userId, materialId) => {
    try {
        await addDoc(collection(db, 'materialViews'), {
            userId,
            materialId,
            viewedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error recording view:", error);
    }
};
