import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';

const SubjectDetailScreen = ({ route, navigation }) => {
    const { subject } = route.params;

    // Placeholder units
    const units = [
        { number: 1, title: 'Introduction', content: 'Basic concepts...' },
        { number: 2, title: 'Core Concepts', content: 'Detailed analysis...' },
        { number: 3, title: 'Advanced Topics', content: 'Complex logic...' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.code}>{subject.code}</Text>
                <Text style={styles.title}>{subject.name}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{subject.credit} Credits</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Course Description</Text>
                <Text style={styles.description}>
                    {subject.description || 'No description available for this subject.'}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Units</Text>
            {units.map((unit) => (
                <TouchableOpacity
                    key={unit.number}
                    style={styles.unitCard}
                    onPress={() => navigation.navigate('UnitDetail', { unit, subjectName: subject.name })}
                >
                    <View style={styles.unitHeader}>
                        <Text style={styles.unitNumber}>Unit {unit.number}</Text>
                    </View>
                    <Text style={styles.unitTitle}>{unit.title}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    code: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    badge: {
        backgroundColor: colors.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: colors.gray,
        lineHeight: 22,
    },
    unitCard: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        elevation: 2,
    },
    unitHeader: {
        marginBottom: 8,
    },
    unitNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    unitTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
});

export default SubjectDetailScreen;
