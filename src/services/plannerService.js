import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

const TASKS_COLLECTION = 'tasks';

export const addTask = async (userId, taskData) => {
    try {
        const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
            userId,
            ...taskData,
            createdAt: serverTimestamp(),
            completed: false,
        });
        return { id: docRef.id, ...taskData };
    } catch (error) {
        throw error;
    }
};

export const getTasks = async (userId) => {
    try {
        const q = query(
            collection(db, TASKS_COLLECTION),
            where('userId', '==', userId),
            orderBy('dueDate', 'asc') // Ensure dueDate is stored as ISO string or timestamp
        );
        const querySnapshot = await getDocs(q);
        const tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });
        return tasks;
    } catch (error) {
        if (error.code === 'failed-precondition') {
            // Index might be missing, return without sorting or handle gracefully
            console.warn('Firestore Index required for sorting. Fetching without sort.');
            const qNoSort = query(
                collection(db, TASKS_COLLECTION),
                where('userId', '==', userId)
            );
            const snap = await getDocs(qNoSort);
            const t = [];
            snap.forEach(d => t.push({ id: d.id, ...d.data() }));
            return t;
        }
        throw error;
    }
};

export const updateTask = async (taskId, updates) => {
    try {
        const taskRef = doc(db, TASKS_COLLECTION, taskId);
        await updateDoc(taskRef, updates);
    } catch (error) {
        throw error;
    }
};

export const deleteTask = async (taskId) => {
    try {
        await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } catch (error) {
        throw error;
    }
};
