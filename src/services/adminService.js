import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { getAdminDashboardStats } from './analyticsService';

// Collection References
const UNI_COLLECTION = 'universities';
const SUBJECTS_COLLECTION = 'subjects';
const SYLLABUS_COLLECTION = 'syllabus';
const MATERIALS_COLLECTION = 'materials';
const ANNOUNCEMENTS_COLLECTION = 'announcements';
const USERS_COLLECTION = 'users';
const PLANNER_TEMPLATES_COLLECTION = 'plannerTemplates';
const FOCUS_CHALLENGES_COLLECTION = 'focusChallenges';
const PROJECTS_COLLECTION = 'projects';
const CAREER_RESOURCES_COLLECTION = 'careerResources';

// Generic Helper for CRUD
const addItem = async (col, data) => {
    const docRef = await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
    return { id: docRef.id, ...data };
};
const updateItem = async (col, id, updates) => {
    await updateDoc(doc(db, col, id), updates);
};
const deleteItem = async (col, id) => {
    await deleteDoc(doc(db, col, id));
};
const getItems = async (col) => {
    const snapshot = await getDocs(collection(db, col));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Universities ---
export const addUniversity = (data) => addItem(UNI_COLLECTION, data);
export const updateUniversity = (id, updates) => updateItem(UNI_COLLECTION, id, updates);
export const deleteUniversity = (id) => deleteItem(UNI_COLLECTION, id);
export const getUniversities = () => getItems(UNI_COLLECTION);

// --- Subjects ---
export const addSubject = (data) => addItem(SUBJECTS_COLLECTION, data);
export const updateSubject = (id, updates) => updateItem(SUBJECTS_COLLECTION, id, updates);
export const deleteSubject = (id) => deleteItem(SUBJECTS_COLLECTION, id);
export const getSubjects = async (universityId, semester) => {
    try {
        let q = collection(db, SUBJECTS_COLLECTION);
        if (universityId) q = query(q, where('universityId', '==', universityId));
        if (semester) q = query(q, where('semester', '==', semester));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { throw error; }
};

// --- Syllabus ---
export const addOrUpdateSyllabus = async (subjectId, syllabusData) => {
    try {
        await setDoc(doc(db, SYLLABUS_COLLECTION, subjectId), syllabusData);
    } catch (error) { throw error; }
};
export const getSyllabus = async (subjectId) => {
    try {
        const docSnap = await getDoc(doc(db, SYLLABUS_COLLECTION, subjectId));
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) { throw error; }
};

// --- Study Materials ---
export const addMaterial = (data) => addItem(MATERIALS_COLLECTION, { ...data, visible: true });
export const updateMaterial = (id, updates) => updateItem(MATERIALS_COLLECTION, id, updates);
export const deleteMaterial = (id) => deleteItem(MATERIALS_COLLECTION, id);
export const getMaterials = async (subjectId) => {
    try {
        let q = collection(db, MATERIALS_COLLECTION);
        if (subjectId) q = query(q, where('subjectId', '==', subjectId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { throw error; }
};

// --- Planner Templates ---
export const addPlannerTemplate = (data) => addItem(PLANNER_TEMPLATES_COLLECTION, data);
export const updatePlannerTemplate = (id, updates) => updateItem(PLANNER_TEMPLATES_COLLECTION, id, updates);
export const deletePlannerTemplate = (id) => deleteItem(PLANNER_TEMPLATES_COLLECTION, id);
export const getPlannerTemplates = () => getItems(PLANNER_TEMPLATES_COLLECTION);

// --- Focus Challenges ---
export const addFocusChallenge = (data) => addItem(FOCUS_CHALLENGES_COLLECTION, data);
export const updateFocusChallenge = (id, updates) => updateItem(FOCUS_CHALLENGES_COLLECTION, id, updates);
export const deleteFocusChallenge = (id) => deleteItem(FOCUS_CHALLENGES_COLLECTION, id);
export const getFocusChallenges = () => getItems(FOCUS_CHALLENGES_COLLECTION);

// --- Project Templates (Renamed to Projects) ---
export const addProject = (data) => addItem(PROJECTS_COLLECTION, data);
export const updateProject = (id, updates) => updateItem(PROJECTS_COLLECTION, id, updates);
export const deleteProject = (id) => deleteItem(PROJECTS_COLLECTION, id);
export const getProjects = () => getItems(PROJECTS_COLLECTION);

// --- Career Resources ---
export const addCareerResource = (data) => addItem(CAREER_RESOURCES_COLLECTION, data);
export const updateCareerResource = (id, updates) => updateItem(CAREER_RESOURCES_COLLECTION, id, updates);
export const deleteCareerResource = (id) => deleteItem(CAREER_RESOURCES_COLLECTION, id);
export const getCareerResources = () => getItems(CAREER_RESOURCES_COLLECTION);

// --- Announcements ---
export const addAnnouncement = (data) => addItem(ANNOUNCEMENTS_COLLECTION, data);
export const updateAnnouncement = (id, updates) => updateItem(ANNOUNCEMENTS_COLLECTION, id, updates);
export const deleteAnnouncement = (id) => deleteItem(ANNOUNCEMENTS_COLLECTION, id);
export const getAnnouncements = () => getItems(ANNOUNCEMENTS_COLLECTION);

// --- Analytics ---
export const getAnalytics = async () => {
    return await getAdminDashboardStats();
};

// --- Student Management ---
export const getAllStudents = async () => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where('role', '==', 'student'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { throw error; }
};

export const updateStudentStatus = async (uid, isActive) => {
    try {
        await updateDoc(doc(db, USERS_COLLECTION, uid), { active: isActive });
    } catch (error) { throw error; }
};

export const updateStudentRole = async (uid, newRole) => {
    try {
        await updateDoc(doc(db, USERS_COLLECTION, uid), { role: newRole });
    } catch (error) { throw error; }
};
