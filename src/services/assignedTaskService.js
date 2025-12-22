import { db } from './firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'assignedTasks';

/**
 * Assign a task to a specific student (Admin only via rules)
 * @param {string} studentId - UID of the student
 * @param {object} taskData - { title, description, dueDate, priority }
 */
export const assignTaskToStudent = async (studentId, taskData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...taskData,
            studentId,
            assignedBy: 'admin', // Could capture specific admin ID if needed
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error assigning task:", error);
        throw error;
    }
};

/**
 * Assign a task to MULTIPLE students (e.g. whole semester)
 * @param {Array<string>} studentIds - Array of student UIDs
 * @param {object} taskData 
 */
export const assignTaskToGroup = async (studentIds, taskData) => {
    try {
        const promises = studentIds.map(uid => assignTaskToStudent(uid, taskData));
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error("Error assigning group task:", error);
        throw error;
    }
};

/**
 * Get assigned tasks for a student
 * @param {string} studentId 
 */
export const getStudentAssignedTasks = async (studentId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('studentId', '==', studentId)
        );

        const querySnapshot = await getDocs(q);
        const tasks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort client-side to avoid Firestore index requirement
        return tasks.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA; // Descending
        });
    } catch (error) {
        console.error("Error fetching assigned tasks:", error);
        throw error;
    }
};

/**
 * Update assigned task status (Admin or maybe Student for simple 'done' toggle if rules allow)
 * Currently rules restrict update to Admin, so this is for Admin management.
 */
export const updateAssignedTask = async (taskId, updates) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, taskId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating assigned task:", error);
        throw error;
    }
};
