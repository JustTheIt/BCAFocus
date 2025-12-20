import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';

const CHALLENGES_COLLECTION = 'focusChallenges';
const SESSIONS_COLLECTION = 'focusSessions';

// Log Focus Session and Update Summary
export const updateFocusStats = async (userId, minutes) => {
    try {
        const docRef = doc(db, SESSIONS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            await updateDoc(docRef, {
                totalMinutes: (data.totalMinutes || 0) + minutes,
                streak: (data.streak || 0) + 1, // Simple logic, could be refined for daily streaks
                lastSessionDate: serverTimestamp()
            });
        } else {
            await setDoc(docRef, {
                totalMinutes: minutes,
                streak: 1,
                lastSessionDate: serverTimestamp(),
                userId
            });
        }
    } catch (error) { throw error; }
};

// Get Focus Stats
export const getFocusStats = async (userId) => {
    try {
        const docSnap = await getDoc(doc(db, SESSIONS_COLLECTION, userId));
        return docSnap.exists() ? docSnap.data() : { totalMinutes: 0, streak: 0 };
    } catch (error) { throw error; }
};

// Get Focus Challenges (Public)
export const getFocusChallenges = async () => {
    try {
        const q = query(collection(db, CHALLENGES_COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { throw error; }
};
