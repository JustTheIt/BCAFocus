import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

const FEEDBACK_COLLECTION = 'feedback';

// Submit feedback (Student)
export const submitFeedback = async (userId, message) => {
    try {
        const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), {
            userId,
            message,
            status: 'pending',
            reply: null,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id };
    } catch (error) {
        throw error;
    }
};

// Get all feedback (Admin)
export const getAllFeedback = async () => {
    try {
        const q = query(collection(db, FEEDBACK_COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw error;
    }
};

// Get my feedback (Student)
export const getMyFeedback = async (userId) => {
    try {
        const q = query(
            collection(db, FEEDBACK_COLLECTION),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const feedback = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort client-side to avoid Firestore index requirement
        return feedback.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA; // Descending
        });
    } catch (error) {
        console.error("Error fetching my feedback:", error);
        throw error;
    }
};

// Reply to feedback (Admin)
export const replyToFeedback = async (feedbackId, replyMessage) => {
    try {
        const ref = doc(db, FEEDBACK_COLLECTION, feedbackId);
        await updateDoc(ref, {
            reply: replyMessage,
            status: 'resolved'
        });
    } catch (error) {
        throw error;
    }
};
