import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SEMESTERS } from '../../constants/data';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const SemesterListScreen = ({ route, navigation }) => {
    const { universityId } = route.params;

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SubjectList', { semesterId: item.id, name: item.name, universityId })}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.semesterNumber}>{item.id}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.semesterName}>{item.name}</Text>
                <Text style={styles.subtitle}>View Subjects & Syllabus</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={SEMESTERS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    semesterNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    textContainer: {
        flex: 1,
    },
    semesterName: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textLight,
    },
});

export default SemesterListScreen;
