import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';

const PROJECT_TEMPLATES_COLLECTION = 'projectTemplates';
const STUDENT_PROJECTS_COLLECTION = 'studentProjects';

// Get Project Templates for a Semester
export const getProjectTemplates = async (semester) => {
    try {
        const q = query(collection(db, PROJECT_TEMPLATES_COLLECTION), where('semester', '==', parseInt(semester)));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { throw error; }
};

// Get Student Project Submissions
export const getStudentProjects = async (userId) => {
    try {
        const docSnap = await getDoc(doc(db, STUDENT_PROJECTS_COLLECTION, userId));
        return docSnap.exists() ? docSnap.data().submissions || [] : [];
    } catch (error) { throw error; }
};

// Submit/Update Project
export const submitProject = async (userId, projectId, status, url = '') => {
    try {
        const docRef = doc(db, STUDENT_PROJECTS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        let submissions = [];
        if (docSnap.exists()) {
            submissions = docSnap.data().submissions || [];
        }

        const existingIndex = submissions.findIndex(s => s.projectId === projectId);
        const submissionData = { projectId, status, url, updatedAt: new Date() };

        if (existingIndex > -1) {
            submissions[existingIndex] = submissionData;
        } else {
            submissions.push(submissionData);
        }

        await setDoc(docRef, { submissions, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) { throw error; }
};
