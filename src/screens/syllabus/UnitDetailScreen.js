import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../../constants/colors';

const UnitDetailScreen = ({ route }) => {
    const { unit, subjectName } = route.params;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.subjectName}>{subjectName}</Text>
            <Text style={styles.unitNumber}>Unit {unit.number}</Text>
            <Text style={styles.title}>{unit.title}</Text>

            <View style={styles.divider} />

            <Text style={styles.textContent}>{unit.content}</Text>

            {/* Placeholder for more content */}
            <Text style={styles.textContent}>
                Detailed breakdown of this unit will go here. Key topics, sub-topics, and learning objectives specific to {unit.title}.
            </Text>
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
    subjectName: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 8,
    },
    unitNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGray,
        marginBottom: 16,
    },
    textContent: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
        marginBottom: 16,
    },
});

export default UnitDetailScreen;
