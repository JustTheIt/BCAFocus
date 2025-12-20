import { db } from './firebase';
import {
    collection,
    query,
    where,
    getDocs,
    getCountFromServer
} from 'firebase/firestore';

/**
 * Get high-level dashboard stats for Admin
 */
const safeCount = async (colRefOrQuery) => {
    try {
        const snapshot = await getCountFromServer(colRefOrQuery);
        return snapshot.data().count;
    } catch (error) {
        console.error(`Error counting collection:`, error);
        return 0; // Fallback to 0
    }
};

export const getAdminDashboardStats = async () => {
    try {
        const usersColl = collection(db, 'users');
        const qStudents = query(usersColl, where('role', '==', 'student'));

        // Active students (e.g., logged in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const qActive = query(usersColl, where('role', '==', 'student'), where('lastLogin', '>=', thirtyDaysAgo));

        const materialsColl = collection(db, 'materials');
        const plannersColl = collection(db, 'studentPlanners');
        const feedbackColl = collection(db, 'feedback');
        const qPendingFeedback = query(feedbackColl, where('status', '==', 'pending'));

        // Run counts independently to avoid one failure blocking others
        const [
            totalStudents,
            activeStudents,
            totalMaterials,
            totalPlanners,
            pendingFeedback
        ] = await Promise.all([
            safeCount(qStudents),
            safeCount(qActive), // Note: This might need an index
            safeCount(materialsColl),
            safeCount(plannersColl),
            safeCount(qPendingFeedback)
        ]);

        return {
            totalStudents,
            activeStudents,
            totalMaterials,
            totalPlanners,
            pendingFeedback
        };
    } catch (error) {
        console.error("Critical error in admin stats:", error);
        return {
            totalStudents: 0,
            activeStudents: 0,
            totalMaterials: 0,
            totalPlanners: 0,
            pendingFeedback: 0
        };
    }
};

/**
 * Get interaction stats for a specific material
 */
export const getMaterialStats = async (materialId) => {
    try {
        const viewsColl = collection(db, 'materialViews');
        const q = query(viewsColl, where('materialId', '==', materialId));
        const snapshot = await getCountFromServer(q);
        return { views: snapshot.data().count };
    } catch (error) {
        console.error("Error fetching material stats:", error);
        return { views: 0 };
    }
};
