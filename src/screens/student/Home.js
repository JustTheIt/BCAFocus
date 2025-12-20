import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getTasks } from '../../services/plannerService';
import { getAnnouncements } from '../../services/adminService';

export default function StudentHomeScreen({ navigation }) {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pendingTasks: 0,
        completedTasks: 0,
        announcements: 0
    });

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        try {
            const [tasks, announcements] = await Promise.all([
                getTasks(user?.uid),
                getAnnouncements()
            ]);

            setStats({
                pendingTasks: tasks.filter(t => !t.completed).length,
                completedTasks: tasks.filter(t => t.completed).length,
                announcements: announcements.length
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const QuickActionCard = ({ icon, title, color, onPress }) => (
        <TouchableOpacity style={[styles.actionCard, { borderLeftColor: color }]} onPress={onPress}>
            <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.actionTitle}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.displayName || user?.email?.split('@')[0] || 'Student'}!</Text>
                    <Text style={styles.university}>{user?.university || 'TU'} • BCA Program</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#FF9500' + '20' }]}>
                            <Ionicons name="clipboard-outline" size={28} color="#FF9500" />
                        </View>
                        <Text style={styles.statValue}>{stats.pendingTasks}</Text>
                        <Text style={styles.statLabel}>Pending Tasks</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#34C759' + '20' }]}>
                            <Ionicons name="checkmark-circle-outline" size={28} color="#34C759" />
                        </View>
                        <Text style={styles.statValue}>{stats.completedTasks}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <QuickActionCard
                        icon="clipboard-outline"
                        title="My Planner"
                        color="#007AFF"
                        onPress={() => navigation.navigate('Planner')}
                    />

                    <QuickActionCard
                        icon="book-outline"
                        title="Study Materials"
                        color="#5856D6"
                        onPress={() => navigation.navigate('Materials')}
                    />

                    <QuickActionCard
                        icon="megaphone-outline"
                        title="Announcements"
                        color="#FF9500"
                        onPress={() => navigation.navigate('Announcements')}
                    />

                    <QuickActionCard
                        icon="chatbubble-outline"
                        title="Feedback & Queries"
                        color="#FF2D55"
                        onPress={() => navigation.navigate('Feedback')}
                    />
                </View>

                {/* Recent Announcements Preview */}
                {stats.announcements > 0 && (
                    <View style={styles.announcementBanner}>
                        <Ionicons name="megaphone" size={20} color="#FF9500" />
                        <Text style={styles.announcementText}>
                            {stats.announcements} new announcement{stats.announcements > 1 ? 's' : ''}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                            <Text style={styles.viewLink}>View</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    content: { padding: 20 },
    welcomeSection: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
    },
    greeting: { fontSize: 16, color: '#fff', opacity: 0.9 },
    userName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 4 },
    university: { fontSize: 14, color: '#fff', opacity: 0.8, marginTop: 8 },
    statsSection: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
    statLabel: { fontSize: 13, color: '#666', textAlign: 'center' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16, color: '#000' },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#000' },
    announcementBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    announcementText: { flex: 1, fontSize: 14, color: '#333' },
    viewLink: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
});
