import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// Note: This service was originally static. We are moving to Firestore-backed data.
// We will keep the function signatures compatible where possible.

export const fetchUniversities = async () => {
    try {
        const q = query(collection(db, 'universities'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching universities:", error);
        return [];
    }
};

export const fetchSemesters = async (uniId) => {
    try {
        // Assuming semesters are a subcollection OR just a field in subjects. 
        // For better structure, let's query the semesters subcollection of the university.
        const q = query(collection(db, `universities/${uniId}/semesters`));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching semesters:", error);
        return [];
    }
};

export const fetchSubjects = async (universityId, semester) => {
    try {
        const q = query(
            collection(db, 'subjects'),
            where('universityId', '==', universityId),
            where('semester', '==', parseInt(semester))
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return [];
    }
};

// NEW: Fetch units/syllabus for a subject
export const fetchSyllabus = async (subjectId) => {
    try {
        const docSnap = await getDoc(doc(db, 'syllabus', subjectId));
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching syllabus:", error);
        return null;
    }
};

export const getUniversityDetails = async (uniId) => {
    try {
        const docRef = doc(db, 'universities', uniId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching university details:", error);
        return null;
    }
};
