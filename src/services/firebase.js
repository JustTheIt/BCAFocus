import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from google-services.json
const firebaseConfig = {
    apiKey: "AIzaSyDH9LVqr6-oA-3sd3dxwgIuZ02vHOxYzxI",
    authDomain: "mpproject-284e6.firebaseapp.com",
    projectId: "mpproject-284e6",
    storageBucket: "mpproject-284e6.firebasestorage.app",
    messagingSenderId: "1094283428914",
    appId: "1:1094283428914:android:44ada278eed082c778682b"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export const db = getFirestore(app);
