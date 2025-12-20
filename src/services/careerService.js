import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const CAREER_PATHS_COLLECTION = 'careerPaths';

// Get all career paths
export const getCareerPaths = async () => {
    try {
        const q = query(collection(db, CAREER_PATHS_COLLECTION), orderBy('title', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { throw error; }
};
