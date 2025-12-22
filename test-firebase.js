const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, limit } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDH9LVqr6-oA-3sd3dxwgIuZ02vHOxYzxI",
    authDomain: "mpproject-284e6.firebaseapp.com",
    projectId: "mpproject-284e6",
    storageBucket: "mpproject-284e6.firebasestorage.app",
    messagingSenderId: "1094283428914",
    appId: "1:1094283428914:android:44ada278eed082c778682b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
    console.log("Testing Firebase Dataase Connection...");
    try {
        // Try to fetch universities (if it exists)
        // Note: This might fail if the user is not authenticated and security rules are strict.
        // But universities read is 'isAuthenticated()'.
        // Let's try to fetch a collection that might be public or just see if the SDK initializes.

        console.log("Attempting to fetch 'universities' collection...");
        const q = query(collection(db, 'universities'), limit(1));
        const snapshot = await getDocs(q);

        console.log("Success! Connection established.");
        console.log("Number of documents found in 'universities':", snapshot.size);
        snapshot.forEach(doc => {
            console.log("Sample Data:", doc.id, "=>", doc.data());
        });

    } catch (error) {
        console.error("Connection failed!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);

        if (error.code === 'permission-denied') {
            console.log("\nTIP: The connection to Firebase is working, but your security rules are blocking the request.");
            console.log("Check if you need to be logged in or if the rules allow public read for this collection.");
        }
    } finally {
        process.exit();
    }
}

testConnection();
