# BCAFocus - Academic Planner for BCA Students 🎓

BCAFocus is a mobile application designed for Tribhuvan University (TU) BCA students to manage their academic life, study materials, and productivity.

## 🚀 Technology Stack

### Frontend (Mobile App)
- **Language**: JavaScript (ES6+)
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (Managed Workflow)
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Stack & Bottom Tab)
- **Icons**: [@expo/vector-icons](https://icons.expo.fyi/) (Ionicons)
- **Styling**: Native StyleSheet (Vanilla JavaScript)

### Backend & Infrastructure
- **BaaS (Backend as a Service)**: [Firebase](https://firebase.google.com/)
  - **Firestore**: NoSQL Document Database for real-time data.
  - **Authentication**: Email/Password based login with Role-Based Access Control (RBAC).
- **Media Hosting**: [Cloudinary](https://cloudinary.com/) (Used for high-speed delivery of PDFs, Notes, and Images).
- **Environment Management**: `react-native-dotenv` for managing sensitive API keys.

---

## 📂 Project Structure

```text
BCAFocus/
├── src/
│   ├── screens/
│   │   ├── admin/      # Management screens (Syllabus, Materials, Feedback)
│   │   ├── student/    # Main student features (Home, Planner, Analytics)
│   │   ├── auth/       # Login and Registration flows
│   │   ├── projects/   # Project Guidance & Submission
│   │   └── focus/       # Focus Mode timer logic
│   ├── services/       # API Layer (Firebase/Cloudinary logic)
│   │   ├── firebase.js # initialization
│   │   ├── authService.js
│   │   └── materialService.js
│   ├── context/        # Global State (AuthContext)
│   ├── navigation/     # Role-based Routing logic
│   ├── constants/      # App Theme & Static Data (Syllabus database)
│   └── utils/          # Helper functions (Upload pickers, Date formatters)
├── assets/             # Images, Splash Screen, Icons
├── .env                # Environment variables (Keys)
└── App.js              # Entry Point
```

---

## 🔐 Core Architecture: Role-Based Access

The app is divided into two main domains based on the user's role stored in Firestore:

1. **Admin Domain**:
   - Create and manage University Syllabus and Subjects.
   - Upload and verify Study Materials.
   - Review Student Project submissions.
   - Reply to User Feedback.
   - Send system-wide Announcements.

2. **Student Domain**:
   - Personalized Academic Planner.
   - Access to University-specific Syllabus.
   - Search/View Materials (Notes, PDF).
   - Submit Project ideas and view admin feedback.
   - Focus Timer to track study sessions.

---

## 🛠️ How to Run Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   Create a `.env` file in the root directory and add your Firebase and Cloudinary credentials.

3. **Start the App**
   ```bash
   npx expo start
   ```
