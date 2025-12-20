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

export const UniversitiesScreen = () => <PlaceholderScreen title="Manage Universities" />;
export const SubjectsScreen = () => <PlaceholderScreen title="Manage Subjects" />;
export const AnnouncementsScreen = () => <PlaceholderScreen title="Manage Announcements" />;
export const AnalyticsScreen = () => <PlaceholderScreen title="Analytics" />;

// Expanded modules
export const MaterialsScreen = () => <PlaceholderScreen title="Manage Study Materials" />;
export const StudentsScreen = () => <PlaceholderScreen title="Manage Students" />;
export const FeedbackScreen = () => <PlaceholderScreen title="Student Feedback" />;
export const SettingsScreen = () => <PlaceholderScreen title="App Settings" />;
