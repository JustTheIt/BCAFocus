import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

const PROJECTS_COLLECTION = 'projects';
const PROJECT_SUBMISSIONS_COLLECTION = 'projectSubmissions';

/**
 * Get Project Instructions/Details (Created by Admin)
 */
export const getProjectInstructions = async (semester) => {
    try {
        const q = semester === 'all'
            ? collection(db, PROJECTS_COLLECTION)
            : query(
                collection(db, PROJECTS_COLLECTION),
                where('semester', '==', parseInt(semester))
            );
        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side to avoid index requirement
        return projects.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });
    } catch (error) { throw error; }
};

/**
 * Submit Project (Student)
 */
export const submitProject = async (submissionData) => {
    try {
        const docRef = await addDoc(collection(db, PROJECT_SUBMISSIONS_COLLECTION), {
            ...submissionData,
            status: 'submitted',
            submittedAt: serverTimestamp()
        });
        return { id: docRef.id, ...submissionData };
    } catch (error) { throw error; }
};

/**
 * Get Student's Submissions (Student)
 */
export const getStudentSubmissions = async (studentId) => {
    try {
        const q = query(
            collection(db, PROJECT_SUBMISSIONS_COLLECTION),
            where('studentId', '==', studentId)
        );
        const snapshot = await getDocs(q);
        const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side to avoid index requirement
        return submissions.sort((a, b) => {
            const timeA = a.submittedAt?.seconds || 0;
            const timeB = b.submittedAt?.seconds || 0;
            return timeB - timeA;
        });
    } catch (error) { throw error; }
};

/**
 * Get All Submissions for a Project (Admin)
 */
export const getProjectSubmissions = async (projectId) => {
    try {
        const q = query(
            collection(db, PROJECT_SUBMISSIONS_COLLECTION),
            where('projectId', '==', projectId)
        );
        const snapshot = await getDocs(q);
        const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side to avoid index requirement
        return submissions.sort((a, b) => {
            const timeA = a.submittedAt?.seconds || 0;
            const timeB = b.submittedAt?.seconds || 0;
            return timeB - timeA;
        });
    } catch (error) { throw error; }
};

/**
 * Update Submission Status (Admin)
 */
export const updateSubmissionStatus = async (submissionId, status, feedback = '') => {
    try {
        const docRef = doc(db, PROJECT_SUBMISSIONS_COLLECTION, submissionId);
        await updateDoc(docRef, {
            status,
            feedback,
            reviewedAt: serverTimestamp()
        });
    } catch (error) { throw error; }
};
