import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { loginUser, registerUser, logoutUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // TOGGLE THIS TO TRUE TO BYPASS AUTH
    const BYPASS_AUTH = false; // Set to false to use real Firebase auth
    // TOGGLE ROLE: 'admin' or 'student'
    const MOCK_ROLE = 'admin';

    // Mock Users
    const MOCK_ADMIN = {
        uid: 'mock_admin_001',
        email: 'admin@bcafocus.com',
        displayName: 'Admin User',
        role: 'admin'
    };

    const MOCK_STUDENT = {
        uid: 'mock_student_001',
        email: 'student@bcafocus.com',
        displayName: 'Student User',
        role: 'student'
    };

    const initialUser = BYPASS_AUTH ? (MOCK_ROLE === 'admin' ? MOCK_ADMIN : MOCK_STUDENT) : null;

    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(!BYPASS_AUTH);

    useEffect(() => {
        if (BYPASS_AUTH) {
            setUser(MOCK_ROLE === 'admin' ? MOCK_ADMIN : MOCK_STUDENT);
            setLoading(false);
            return;
        }

        // Listen to Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user profile from Firestore to get role and other data
                try {
                    const { doc, getDoc } = await import('firebase/firestore');
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const profile = userDoc.data();

                        // Enforce Active Status
                        if (profile.active === false) {
                            console.warn("User account is inactive. Logging out.");
                            await logoutUser();
                            setUser(null);
                            await AsyncStorage.removeItem('userSession');
                            return;
                        }

                        // Merge Firebase Auth user with Firestore profile data
                        const userData = {
                            ...firebaseUser,
                            ...profile
                        };
                        setUser(userData);
                        await AsyncStorage.setItem('userSession', JSON.stringify(userData));
                    } else {
                        // User document doesn't exist in Firestore
                        // We might want to force logout here too if we strict about profile existing
                        // For now we allow it but it's risky. Let's keep existing behavior but consider locking down.
                        setUser(firebaseUser);
                        await AsyncStorage.setItem('userSession', JSON.stringify(firebaseUser));
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUser(firebaseUser);
                }
            } else {
                setUser(null);
                await AsyncStorage.removeItem('userSession');
            }
            setLoading(false);
        });

        // Check for persisted session on initial load
        const checkPersistedSession = async () => {
            try {
                const session = await AsyncStorage.getItem('userSession');
                if (session && !user) {
                    // Ideally, we rely on onAuthStateChanged, but this can serve as a quick check
                    // or for complex offline scenarios. For standard Firebase, onAuthStateChanged handles persistence
                    // automatically if configured with getReactNativePersistence.
                    // We'll trust firebase auth listener primarily.
                }
            } catch (error) {
                console.error("Session restoration error", error);
            }
        };

        checkPersistedSession();

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            return await loginUser(email, password);
        } catch (error) {
            throw error;
        }
    };

    const register = async (email, password, additionalData) => {
        try {
            return await registerUser(email, password, additionalData);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            setUser(null); // Explicitly clear user state for UI update
            await AsyncStorage.removeItem('userSession');
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);
