const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } = require("firebase/firestore");

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

const universities = [
    {
        id: "TU",
        name: "Tribhuvan University",
        totalCredits: 126,
        semesters: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
        id: "PU",
        name: "Pokhara University",
        totalCredits: 120,
        semesters: [1, 2, 3, 4, 5, 6, 7, 8]
    }
];

const subjects = [
    {
        universityId: "TU",
        semester: 1,
        name: "Computer Fundamentals",
        code: "CACS101",
        creditHours: 3
    },
    {
        universityId: "TU",
        semester: 1,
        name: "Society and Technology",
        code: "CACS102",
        creditHours: 3
    },
    {
        universityId: "TU",
        semester: 1,
        name: "English I",
        code: "CAEN103",
        creditHours: 3
    }
];

async function seedData() {
    console.log("🚀 Starting Data Seeding...");

    try {
        // Seed Universities
        console.log("📍 Seeding Universities...");
        for (const uni of universities) {
            await setDoc(doc(db, "universities", uni.id), {
                ...uni,
                createdAt: serverTimestamp()
            });
            console.log(`✅ Seeded University: ${uni.name}`);
        }

        // Seed Subjects
        console.log("📚 Seeding Subjects...");
        for (const subject of subjects) {
            await addDoc(collection(db, "subjects"), {
                ...subject,
                createdAt: serverTimestamp()
            });
            console.log(`✅ Seeded Subject: ${subject.name}`);
        }

        console.log("\n✨ Seeding Complete! Your database now has initial data.");
        console.log("TIP: You can now check the 'Materials' or 'University' screens in the app.");

    } catch (error) {
        console.error("❌ Seeding Failed!");
        console.error("Error:", error.message);
        console.log("\nIf you see a 'permission-denied' error, you may need to temporarily set your Firestore rules to allow public writes OR run this with an admin service account (not recommended for simple verification).");
    } finally {
        process.exit();
    }
}

seedData();
