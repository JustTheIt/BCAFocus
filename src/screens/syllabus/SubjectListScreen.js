import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { UNIVERSITY_SYLLABUS } from '../../constants/universityData';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const SubjectListScreen = ({ route, navigation }) => {
    const { semesterId, name, universityId } = route.params;

    // Fetch subjects based on selected university and semester
    const subjects = UNIVERSITY_SYLLABUS[universityId]?.[semesterId] || [];

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SubjectDetail', { subject: item })}
        >
            <View style={styles.codeContainer}>
                {/* Display simplified code (e.g., 'BCA 101' -> 'BCA') or full if short */}
                <Text style={styles.code}>{item.code.split(' ')[0]}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.credit}>{item.credit} Credit{item.credit > 1 ? 's' : ''} • {item.code}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={subjects}
                renderItem={renderItem}
                keyExtractor={(item) => item.code}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No subjects found for this semester.</Text>
                    </View>
                }
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
    codeContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    code: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    credit: {
        fontSize: 12,
        color: colors.textLight,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.gray,
    },
});

export default SubjectListScreen;
