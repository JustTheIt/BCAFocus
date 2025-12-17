import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { UNIVERSITIES } from '../../constants/universityData';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const UniversityListScreen = ({ navigation }) => {
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SemesterList', { universityId: item.id, universityName: item.shortName })}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="school" size={28} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.universityName}>{item.name}</Text>
                <Text style={styles.shortName}>{item.shortName} • {item.totalCredits} Credits</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Select University</Text>
            <FlatList
                data={UNIVERSITIES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 16,
        paddingHorizontal: 16,
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
        marginBottom: 16,
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
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    universityName: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    shortName: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: colors.gray,
    },
});

export default UniversityListScreen;
