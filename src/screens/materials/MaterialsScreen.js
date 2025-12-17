import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const MaterialsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Study Materials</Text>
            <Text style={styles.subText}>Notes & PDFs coming soon...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    subText: {
        marginTop: 10,
        color: colors.textLight,
    },
});

export default MaterialsScreen;
