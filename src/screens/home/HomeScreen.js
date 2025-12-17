import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const DashboardCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]} onPress={onPress}>
        <View style={styles.cardHeader}>
            <Ionicons name={icon} size={32} color={colors.white} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';

    const menuItems = [
        { title: 'Syllabus', icon: 'book', color: '#4CAF50', route: 'SyllabusTab' },
        { title: 'Planner', icon: 'calendar', color: '#2196F3', route: 'PlannerTab' },
        { title: 'Focus Mode', icon: 'hourglass', color: '#FF9800', route: 'Focus' },
        { title: 'Materials', icon: 'library', color: '#9C27B0', route: 'Materials' },
        { title: 'Projects', icon: 'code-slash', color: '#607D8B', route: 'Projects' },
        { title: 'Career', icon: 'briefcase', color: '#795548', route: 'Career' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.username}>{displayName}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.banner}>
                    <Text style={styles.bannerText}>Keep pushing forward! 🚀</Text>
                    <Text style={styles.bannerSubText}>"The future belongs to those who believe in the beauty of their dreams."</Text>
                </View>

                <Text style={styles.sectionTitle}>Quick Access</Text>
                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <DashboardCard
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            color={item.color}
                            onPress={() => navigation.navigate(item.route)}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: colors.textLight,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    banner: {
        backgroundColor: colors.accent,
        borderRadius: 15,
        padding: 20,
        marginBottom: 25,
    },
    bannerText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    bannerSubText: {
        color: colors.lightGray,
        fontSize: 14,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 0.8,
        borderRadius: 15,
        padding: 15,
        marginBottom: 16,
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        alignItems: 'flex-start',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
    },
});

export default HomeScreen;
