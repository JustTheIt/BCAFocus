## ☁️ Cloudinary Configuration

**Services**: `Material Storage`, `Project Submissions`, `Career Resources`
- **Cloud Name**: (Configured in `src/services/cloudinaryService.js`)
- **Upload Preset**: (Unsigned preset required)
- **Files**: Handled via `expo-document-picker` and uploaded to specific folders.
- **Location**: `src/services/cloudinaryService.js` and `src/utils/uploadUtils.js`

---

## 📊 Firestore Database Structure

### Collections

#### 1. **users**
```javascript
{
  uid: string,              // User ID (document ID)
  email: string,
  name: string,
  role: "admin" | "student", // Role-based access
  active: boolean,           // Account status
  university: "TU" | "PU" | "Purbanchal",
  createdAt: timestamp
}
```

#### 2. **tasks** (Planner)
```javascript
{
  taskId: string,           // Document ID
  userId: string,           // Reference to user
  title: string,
  description: string,
  completed: boolean,
  priority: "Low" | "Medium" | "High",
  dueDate: timestamp,
  createdAt: timestamp
}
```

#### 3. **universities**
```javascript
{
  uniId: string,            // TU, PU, Purbanchal
  name: string,
  totalCredits: number,
  creditBreakdown: {
    core: number,
    elective: number,
    math: number,
    language: number,
    projects: number
  },
  semesters: array          // Semester data
}
```

#### 4. **subjects**
```javascript
{
  subjectId: string,
  name: string,
  code: string,
  creditHours: number,
  description: string,
  units: array,
  semesterId: string,
  uniId: string
}
```

#### 5. **materials** (Study Materials)
```javascript
{
  materialId: string,
  subjectId: string,
  title: string,
  cloudinaryUrl: string,      // Cloudinary URL
  publicId: string,           // Cloudinary Public ID
  fileType: "pdf" | "video" | "link" | string,
  uploadedAt: timestamp
}
```

#### 6. **announcements**
```javascript
{
  announcementId: string,
  title: string,
  description: string,
  target: "all" | "university" | "semester",
  createdAt: timestamp
}
```

#### 7. **feedback**
```javascript
{
  feedbackId: string,
  userId: string,
  message: string,
  reply: string,
  status: "pending" | "resolved",
  createdAt: timestamp
}
```

---

## 🛠️ Backend Services

### 1. **authService.js**
- `registerUser(email, password, additionalData)` - Register with role assignment
- `loginUser(email, password)` - Login
- `logoutUser()` - Logout
- `updateUserProfile(uid, data)` - Update profile

### 2. **adminService.js**
**Universities**
- `addUniversity(data)`
- `updateUniversity(id, updates)`
- `deleteUniversity(id)`
- `getUniversities()`

**Subjects**
- `addSubject(data)`
- `updateSubject(id, updates)`
- `deleteSubject(id)`
- `getSubjects(uniId, semesterId)`

**Announcements**
- `addAnnouncement(data)`
- `deleteAnnouncement(id)`
- `getAnnouncements()`

**Student Management**
- `getAllStudents()` - Get all students
- `updateStudentStatus(uid, isActive)` - Activate/deactivate
- `updateStudentRole(uid, newRole)` - Change role

**Analytics**
- `getAnalytics()` - Returns { totalStudents, totalTasks }

### 3. **plannerService.js**
- `addTask(userId, taskData)` - Create task
- `getTasks(userId)` - Get user tasks
- `updateTask(taskId, updates)` - Update task
- `deleteTask(taskId)` - Delete task

### 4. **materialService.js**
- `uploadMaterial(materialData)` - Admin upload
- `getMaterials(subjectId)` - Get materials
- `deleteMaterial(id)` - Admin delete

### 5. **feedbackService.js**
- `submitFeedback(userId, message)` - Student submit
- `getAllFeedback()` - Admin view all
- `getMyFeedback(userId)` - Student view own
- `replyToFeedback(id, reply)` - Admin reply

### 6. **universityService.js**
- `fetchUniversities()` - Get all universities
- `fetchSemesters(uniId)` - Get semesters
- `fetchSubjects(uniId, semesterId)` - Get subjects

---

## 🔐 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // Users: Own data only
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Tasks: Own tasks only
    match /tasks/{taskId} {
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete, read: if request.auth.uid == resource.data.userId;
    }

    // Content: Admin write, Public read
    match /universities/{docId} {
      allow write: if isAdmin();
      allow read: if true;
    }
    match /subjects/{docId} {
      allow write: if isAdmin();
      allow read: if true;
    }
    match /materials/{docId} {
      allow write: if isAdmin();
      allow read: if true;
    }
    match /announcements/{docId} {
      allow write: if isAdmin();
      allow read: if true;
    }

    // Feedback: Create public, Read own/admin, Update admin
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      allow update: if isAdmin();
    }
  }
}
```

---

## 🎨 Admin Dashboard Features

### Screens Created
1. **AdminDashboard.js** - Main hub with analytics
2. **Universities.js** - Manage universities (placeholder)
3. **Subjects.js** - Manage subjects (placeholder)
4. **Announcements.js** - Manage announcements (placeholder)
5. **Materials.js** - Manage study materials (placeholder)
6. **Students.js** - Manage students (placeholder)
7. **Feedback.js** - View/reply to feedback (placeholder)
8. **Analytics.js** - Detailed analytics (placeholder)
9. **Settings.js** - App settings (placeholder)

### Admin Capabilities
✅ View total students and tasks
✅ Manage universities, semesters, subjects
✅ Upload and manage study materials
✅ Create announcements
✅ View and reply to student feedback
✅ Manage student accounts (activate/deactivate, change roles)
✅ View analytics

---

## 👨‍🎓 Student Features

### Screens Created (Placeholders)
1. **Home.js** - Student dashboard
2. **University.js** - View syllabus
3. **Semester.js** - Semester view
4. **Subject.js** - Subject details
5. **Materials.js** - Study materials
6. **Planner.js** - Task planner
7. **Announcements.js** - View announcements
8. **Feedback.js** - Submit feedback
9. **Focus.js** - Pomodoro timer
10. **Profile.js** - User profile

### Student Capabilities
✅ View universities and syllabus (read-only)
✅ Manage personal tasks
✅ Access study materials
✅ View announcements
✅ Submit feedback and queries
✅ Update profile

---

## 🔄 Authentication Flow

1. **Registration**: Creates user in Auth + Firestore with role="student"
2. **Login**: Fetches Auth user + Firestore profile (includes role)
3. **Role-Based Routing**:
   - `role === "admin"` → Admin Dashboard
   - `role === "student"` → Student Dashboard
4. **Session**: Persisted via AsyncStorage + Firebase Auth

---

## 📁 File Structure

```
src/
├── services/
│   ├── firebase.js              # Firebase config
│   ├── authService.js           # Authentication
│   ├── adminService.js          # Admin CRUD
│   ├── plannerService.js        # Tasks
│   ├── materialService.js       # Study materials
│   ├── feedbackService.js       # Feedback
│   └── universityService.js     # University data
├── context/
│   └── AuthContext.js           # Auth state + role management
├── navigation/
│   ├── AppNavigator.js          # Role-based routing
│   ├── AdminNavigator.js        # Admin screens
│   ├── AuthNavigator.js         # Login/Register
│   └── TabNavigator.js          # Student screens
├── screens/
│   ├── admin/
│   │   ├── AdminDashboard.js
│   │   └── AdminScreens.js      # Placeholders
│   └── student/
│       └── StudentScreens.js    # Placeholders
└── constants/
    └── universityData.js        # Static data
```

---

## 🚀 Current Status

✅ Firebase connected
✅ Authentication working
✅ Role-based navigation implemented
✅ All services created
✅ Security rules defined
✅ Admin dashboard functional
✅ Database structure ready

**Next Steps**: Build out the placeholder screens with actual UI and functionality!
