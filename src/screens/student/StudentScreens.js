import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ title }) => (
    <View style={styles.container}>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.subText}>Feature coming soon...</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 20, fontWeight: 'bold' },
    subText: { fontSize: 14, color: '#666', marginTop: 8 }
});

export const HomeScreen = () => <PlaceholderScreen title="Student Home" />;
export const UniversityScreen = () => <PlaceholderScreen title="University Syllabus" />;
export const SemesterScreen = () => <PlaceholderScreen title="Semester View" />;
export const SubjectScreen = () => <PlaceholderScreen title="Subject Details" />;
export const MaterialsScreen = () => <PlaceholderScreen title="Study Materials" />;
export const PlannerScreen = () => <PlaceholderScreen title="My Planner" />;
export const AnnouncementsScreen = () => <PlaceholderScreen title="Announcements" />;
export const FeedbackScreen = () => <PlaceholderScreen title="Feedback & Queries" />;
export const FocusScreen = () => <PlaceholderScreen title="Focus Timer" />;
export const ProfileScreen = () => <PlaceholderScreen title="My Profile" />;
