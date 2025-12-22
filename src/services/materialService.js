import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

const MATERIALS_COLLECTION = 'materials';

/**
 * Upload material (Admin or Student)
 * @param {Object} materialData 
 * @param {string} userRole - 'admin' or 'student'
 */
export const uploadMaterial = async (materialData, userRole) => {
    try {
        const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), {
            ...materialData,
            approved: userRole === 'admin', // Auto-approve for admin
            uploadedBy: userRole,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...materialData };
    } catch (error) {
        throw error;
    }
};

/**
 * Approve material (Admin only)
 */
export const approveMaterial = async (materialId) => {
    try {
        const docRef = doc(db, MATERIALS_COLLECTION, materialId);
        await updateDoc(docRef, { approved: true });
    } catch (error) {
        throw error;
    }
};

/**
 * Reject/Delete material (Admin only)
 */
export const rejectMaterial = async (materialId) => {
    try {
        await deleteDoc(doc(db, MATERIALS_COLLECTION, materialId));
    } catch (error) {
        throw error;
    }
};

/**
 * Get materials
 * @param {string} subjectId 
 * @param {string} userRole 
 * @param {string} userId 
 */
export const getMaterials = async (subjectId, userRole = 'student', userId = null) => {
    try {
        let q = collection(db, MATERIALS_COLLECTION);
        let conditions = [];

        if (subjectId !== 'all') {
            conditions.push(where('subjectId', '==', subjectId));
        }

        if (userRole === 'admin') {
            // Admin sees all materials for the subject
            // No additional filter needed
        } else {
            // Students see approved materials OR their own pending ones
            // Firestore doesn't support easy OR between fields in separate queries without indexing/complex stuff
            // So we'll fetch approved ones and then filter in client or use separate queries
            conditions.push(where('approved', '==', true));
        }

        const qry = query(q, ...conditions);
        const snapshot = await getDocs(qry);
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // If student, also fetch their own pending materials
        if (userRole === 'student' && userId) {
            const pendingQ = query(
                collection(db, MATERIALS_COLLECTION),
                where('uploaderId', '==', userId),
                where('approved', '==', false)
            );
            const pendingSnapshot = await getDocs(pendingQ);
            const pendingResults = pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Merge and deduplicate if necessary (though they shouldn't overlap)
            results = [...results, ...pendingResults];
        }

        return results;
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
