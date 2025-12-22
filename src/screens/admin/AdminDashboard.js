import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAnalytics } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const DashboardCard = ({ title, icon, value, onPress, color }) => (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            {value !== undefined && <Text style={styles.cardValue}>{value}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
);

export default function AdminDashboard({ navigation }) {
    const { logout, user } = useAuth();
    const [analytics, setAnalytics] = useState({ totalStudents: 0, totalTasks: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const data = await getAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to load analytics", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Admin Portal</Text>
                    <Text style={styles.subGreeting}>Welcome back, {user?.displayName || 'Admin'}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Analytics Section */}
                <View style={styles.statsRow}>
                    <View key="students-stat" style={styles.statBox}>
                        <Text style={styles.statValue}>{analytics.totalStudents}</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                    <View key="tasks-stat" style={styles.statBox}>
                        <Text style={styles.statValue}>{analytics.totalTasks}</Text>
                        <Text style={styles.statLabel}>Tasks Done</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Management</Text>

                <DashboardCard
                    key="universities"
                    title="Universities"
                    icon="school-outline"
                    color="#007AFF"
                    onPress={() => navigation.navigate('Universities')}
                />

                <DashboardCard
                    key="subjects"
                    title="Subjects"
                    icon="book-outline"
                    color="#5856D6"
                    onPress={() => navigation.navigate('Subjects')}
                />

                <DashboardCard
                    key="materials"
                    title="Materials"
                    icon="library-outline"
                    color="#5AC8FA"
                    onPress={() => navigation.navigate('Materials')}
                />

                <DashboardCard
                    key="projects"
                    title="Projects"
                    icon="folder-open-outline"
                    color="#FF2D55"
                    onPress={() => navigation.navigate('Projects')}
                />

                <DashboardCard
                    key="career"
                    title="Career Paths"
                    icon="briefcase-outline"
                    color="#AF52DE"
                    onPress={() => navigation.navigate('Career')}
                />

                <DashboardCard
                    key="announcements"
                    title="Announcements"
                    icon="megaphone-outline"
                    color="#FF9500"
                    onPress={() => navigation.navigate('Announcements')}
                />

                <DashboardCard
                    key="analytics"
                    title="Analytics Detail"
                    icon="stats-chart-outline"
                    color="#34C759"
                    onPress={() => navigation.navigate('Analytics')}
                />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#000' },
    subGreeting: { fontSize: 14, color: '#666', marginTop: 4 },
    logoutButton: { padding: 8 },
    scrollContent: { padding: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statBox: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#000' },
    statLabel: { fontSize: 13, color: '#666', marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 8,
        marginRight: 16,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '500', color: '#000' },
    cardValue: { fontSize: 12, color: '#666', marginTop: 2 },
});
