# BCA Focus - Setup & Testing Guide

## ✅ Setup Checklist

### Firebase Console Setup
- [x] Firebase project created (`mpproject-284e6`)
- [x] Firebase config added to `src/services/firebase.js`
- [ ] **Authentication enabled** (Email/Password provider)
- [ ] **Firestore Database created**
- [ ] **Security rules deployed** from `firestore.rules`

### Code Setup
- [x] All services created (auth, admin, planner, material, feedback, university)
- [x] AuthContext with role-based routing
- [x] Admin Dashboard created
- [x] Student screens (placeholders)
- [x] Navigation configured
- [x] Security rules defined

---

## 🧪 Testing Guide

### 1. Test Authentication

**Register a Student Account:**
```
1. Run the app
2. Click "Register" or "Sign Up"
3. Enter email and password
4. Account created with role="student" by default
```

**Verify in Firestore:**
```
Firebase Console → Firestore → users collection
Check that your user has:
- email
- role: "student"
- active: true
- university: "TU"
```

### 2. Test Student Dashboard

**Login as Student:**
```
1. Login with student credentials
2. Should see Student Dashboard (TabNavigator)
3. Can access: Home, Planner, Materials, etc.
```

### 3. Test Admin Access

**Create Admin User:**
```
Option A - Manual (Recommended for first admin):
1. Register a new account OR use existing
2. Go to Firestore Console → users → [your-uid]
3. Edit the "role" field: change "student" to "admin"
4. Logout and login again
5. Should see Admin Dashboard

Option B - Via Code (after first admin exists):
1. Login as admin
2. Use adminService.updateStudentRole(uid, 'admin')
```

**Test Admin Features:**
```
1. Login as admin
2. Should see Admin Dashboard with:
   - Analytics cards (Students count, Tasks count)
   - Management cards (Universities, Subjects, etc.)
3. Click logout - should return to login screen
```

### 4. Test Services

**Test Planner (Student):**
```javascript
import { addTask, getTasks } from './src/services/plannerService';

// Add a task
await addTask(userId, {
  title: "Study React Native",
  description: "Complete tutorial",
  priority: "High",
  dueDate: new Date()
});

// Get tasks
const tasks = await getTasks(userId);
console.log(tasks);
```

**Test Admin Service:**
```javascript
import { getAnalytics, getAllStudents } from './src/services/adminService';

// Get analytics
const stats = await getAnalytics();
console.log(stats); // { totalStudents: X, totalTasks: Y }

// Get all students
const students = await getAllStudents();
console.log(students);
```

---

## 🔧 Common Issues & Fixes

### Issue: "Permission Denied" errors

**Cause**: Security rules not deployed or user not authenticated

**Fix**:
1. Copy `firestore.rules` content
2. Go to Firebase Console → Firestore → Rules
3. Paste and Publish
4. Ensure user is logged in

### Issue: Role not showing / Not routing to Admin

**Cause**: User document missing role field OR not logging out after role change

**Fix**:
1. Check Firestore: users → [uid] → verify "role" field exists
2. Logout completely from app
3. Login again (AuthContext will fetch role from Firestore)

### Issue: "Cannot read property 'role' of undefined"

**Cause**: User object not loaded yet

**Fix**: Already handled in AuthContext with loading state

### Issue: Analytics showing 0/0

**Cause**: Either no data in Firestore OR permission denied

**Fix**:
1. Create some test data (register users, create tasks)
2. Verify security rules allow admin to read users collection
3. Check console for errors

---

## 📝 Next Development Steps

### Priority 1: Build Admin Screens
1. **Universities Management**
   - List universities
   - Add/Edit/Delete forms
   - Semester management

2. **Subjects Management**
   - List subjects by university/semester
   - Add/Edit/Delete forms
   - Associate with semesters

3. **Student Management**
   - List all students
   - View details
   - Activate/Deactivate
   - Change roles

### Priority 2: Build Student Screens
1. **Home Dashboard**
   - Welcome message
   - Quick stats
   - Recent announcements

2. **Planner**
   - Task list
   - Add/Edit/Delete tasks
   - Filter by priority/status

3. **Materials**
   - Browse by subject
   - Download/view materials

### Priority 3: Advanced Features
1. **Announcements**
   - Create with rich text
   - Target specific groups
   - Push notifications

2. **Feedback System**
   - Student submission form
   - Admin reply interface
   - Status tracking

3. **Analytics**
   - Charts and graphs
   - Export data
   - Activity logs

---

## 🚀 Deployment Checklist

### Before Production
- [ ] Replace test Firebase config with production
- [ ] Update security rules (remove test mode)
- [ ] Set up Firebase Storage for materials
- [ ] Enable Firebase Analytics
- [ ] Set up error logging (Sentry/Crashlytics)
- [ ] Test on real devices (Android/iOS)
- [ ] Set up CI/CD pipeline
- [ ] Create app icons and splash screens
- [ ] Prepare for app store submission

### Security
- [ ] Review all security rules
- [ ] Enable App Check
- [ ] Set up rate limiting
- [ ] Implement proper error handling
- [ ] Sanitize user inputs
- [ ] Add CAPTCHA for registration

---

## 📞 Support

For issues or questions:
1. Check `BACKEND_DOCUMENTATION.md` for API reference
2. Review `firestore.rules` for permission issues
3. Check Firebase Console logs
4. Review code comments in service files

**Current Status**: ✅ Backend fully configured and ready for UI development!
