import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import UniversitiesScreen from '../screens/admin/Universities';
import StudentsScreen from '../screens/admin/Students';
import SubjectsScreen from '../screens/admin/Subjects';
import AnnouncementsScreen from '../screens/admin/Announcements';
import { AnalyticsScreen, SettingsScreen } from '../screens/admin/AdminScreens';
import MaterialsScreen from '../screens/admin/Materials';
import FeedbackScreen from '../screens/admin/Feedback';
import ProjectsScreen from '../screens/admin/Projects';
import CareerScreen from '../screens/admin/Career';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboard}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="Universities" component={UniversitiesScreen} />
            <Stack.Screen name="Students" component={StudentsScreen} />
            <Stack.Screen name="Subjects" component={SubjectsScreen} />
            <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="Materials" component={MaterialsScreen} />
            <Stack.Screen name="Projects" component={ProjectsScreen} />
            <Stack.Screen name="Career" component={CareerScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
    );
}
