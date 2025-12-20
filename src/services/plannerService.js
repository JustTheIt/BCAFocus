import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';

const STUDENT_PLANNERS_COLLECTION = 'studentPlanners';
const PLANNER_TEMPLATES_COLLECTION = 'plannerTemplates';

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

// Legacy Support (Optional: bridge to old screens if they use taskId)
// If UI isn't updated yet, this might break.
// But the task is to redesign the backend system.
