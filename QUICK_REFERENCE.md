# Quick Reference - BCA Focus

## 🔥 Service Imports

```javascript
// Authentication
import { registerUser, loginUser, logoutUser, updateUserProfile } from '../services/authService';
import { useAuth } from '../context/AuthContext';

// Admin Services
import { 
  addUniversity, updateUniversity, deleteUniversity, getUniversities,
  addSubject, updateSubject, deleteSubject, getSubjects,
  addAnnouncement, deleteAnnouncement, getAnnouncements,
  getAllStudents, updateStudentStatus, updateStudentRole,
  getAnalytics 
} from '../services/adminService';

// Planner
import { addTask, getTasks, updateTask, deleteTask } from '../services/plannerService';

// Materials
import { uploadMaterial, getMaterials, deleteMaterial } from '../services/materialService';

// Feedback
import { submitFeedback, getAllFeedback, getMyFeedback, replyToFeedback } from '../services/feedbackService';

// University Data
import { fetchUniversities, fetchSemesters, fetchSubjects } from '../services/universityService';
```

## 🎯 Common Patterns

### Get Current User
```javascript
const { user, loading, login, register, logout } = useAuth();

// Access user data
console.log(user.uid);        // User ID
console.log(user.email);      // Email
console.log(user.role);       // "admin" or "student"
console.log(user.university); // "TU", "PU", or "Purbanchal"
```

### Fetch Data on Mount
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const result = await getYourData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

### Add Item
```javascript
const handleAdd = async () => {
  try {
    await addItem(data);
    // Refresh list
    const updated = await getItems();
    setItems(updated);
  } catch (error) {
    alert(error.message);
  }
};
```

### Delete Item
```javascript
const handleDelete = async (id) => {
  if (confirm('Are you sure?')) {
    try {
      await deleteItem(id);
      // Remove from state
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      alert(error.message);
    }
  }
};
```

## 📱 Navigation

```javascript
// In screen component
export default function MyScreen({ navigation }) {
  // Navigate to another screen
  navigation.navigate('ScreenName');
  
  // Go back
  navigation.goBack();
  
  // Pass parameters
  navigation.navigate('Details', { id: 123 });
}

// Receive parameters
export default function DetailsScreen({ route }) {
  const { id } = route.params;
}
```

## 🎨 Common Components

### Loading Spinner
```javascript
if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
```

### Empty State
```javascript
if (items.length === 0) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No items found</Text>
    </View>
  );
}
```

### List with FlatList
```javascript
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <Text>{item.title}</Text>
    </TouchableOpacity>
  )}
  refreshing={refreshing}
  onRefresh={onRefresh}
/>
```

## 🔐 Role Checking

```javascript
const { user } = useAuth();

// Check if admin
if (user?.role === 'admin') {
  // Show admin features
}

// Check if student
if (user?.role === 'student') {
  // Show student features
}
```

## 📝 Form Handling

```javascript
const [formData, setFormData] = useState({
  title: '',
  description: ''
});

const handleChange = (field, value) => {
  setFormData({ ...formData, [field]: value });
};

const handleSubmit = async () => {
  if (!formData.title) {
    alert('Title is required');
    return;
  }
  
  try {
    await submitData(formData);
    setFormData({ title: '', description: '' });
  } catch (error) {
    alert(error.message);
  }
};

// In JSX
<TextInput
  value={formData.title}
  onChangeText={(text) => handleChange('title', text)}
  placeholder="Enter title"
/>
```

## 🎯 Error Handling

```javascript
try {
  await someAsyncOperation();
} catch (error) {
  // Firebase errors
  if (error.code === 'permission-denied') {
    alert('You do not have permission');
  } else if (error.code === 'not-found') {
    alert('Item not found');
  } else {
    alert(error.message);
  }
}
```

## 🚀 Quick Start Commands

```bash
# Start development server
npx expo start

# Clear cache and restart
npx expo start -c

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```
