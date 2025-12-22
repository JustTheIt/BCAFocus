import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, addDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

const STUDENT_PLANNERS_COLLECTION = 'studentPlanners';
const PLANNER_TEMPLATES_COLLECTION = 'plannerTemplates';
const TASKS_COLLECTION = 'tasks';

// Get or Create Student Planner
export const getStudentPlanner = async (userId) => {
    try {
        const docRef = doc(db, STUDENT_PLANNERS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            // Initialize empty planner
            const initialData = { tasks: [], updatedAt: serverTimestamp() };
            await setDoc(docRef, initialData);
            return { id: userId, ...initialData };
        }
    } catch (error) { throw error; }
};

// Update Tasks in Student Planner
export const updatePlannerTasks = async (userId, tasks) => {
    try {
        const docRef = doc(db, STUDENT_PLANNERS_COLLECTION, userId);
        await updateDoc(docRef, {
            tasks,
            updatedAt: serverTimestamp()
        });
    } catch (error) { throw error; }
};

// Fetch Templates for a Semester
export const getPlannerTemplatesBySemester = async (semester) => {
    try {
        const q = query(collection(db, PLANNER_TEMPLATES_COLLECTION), where('semester', '==', parseInt(semester)));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { throw error; }
};

// Individual Task Management (for Student Planner)

export const addTask = async (userId, taskData) => {
    try {
        const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
            ...taskData,
            userId,
            completed: false,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...taskData };
    } catch (error) { throw error; }
};

export const getTasks = async (userId) => {
    try {
        const q = query(
            collection(db, TASKS_COLLECTION),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side to avoid Firestore index requirement
        return tasks.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA; // Descending
        });
    } catch (error) { throw error; }
};

export const updateTask = async (taskId, updates) => {
    try {
        const docRef = doc(db, TASKS_COLLECTION, taskId);
        await updateDoc(docRef, updates);
    } catch (error) { throw error; }
};

export const deleteTask = async (taskId) => {
    try {
        const docRef = doc(db, TASKS_COLLECTION, taskId);
        await deleteDoc(docRef);
    } catch (error) { throw error; }
};
