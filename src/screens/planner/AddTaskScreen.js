import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { addTask } from '../../services/plannerService';
import colors from '../../constants/colors';

const AddTaskScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]); // Simple YYYY-MM-DD
    const [priority, setPriority] = useState('Medium');
    const [loading, setLoading] = useState(false);

    const handleAddTask = async () => {
        if (!title) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        setLoading(true);
        try {
            await addTask(user.uid, {
                title,
                description,
                dueDate,
                priority,
            });
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to add task: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const PriorityBadge = ({ level }) => (
        <TouchableOpacity
            style={[
                styles.priorityBadge,
                priority === level && styles.prioritySelected,
                priority === level && { backgroundColor: getPriorityColor(level) }
            ]}
            onPress={() => setPriority(level)}
        >
            <Text style={[
                styles.priorityText,
                priority === level && { color: colors.white }
            ]}>{level}</Text>
        </TouchableOpacity>
    );

    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return colors.error;
            case 'Medium': return colors.warning;
            case 'Low': return colors.success;
            default: return colors.gray;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Study C Programming"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Details about the task..."
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
            <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
                <PriorityBadge level="High" />
                <PriorityBadge level="Medium" />
                <PriorityBadge level="Low" />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleAddTask} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <Text style={styles.buttonText}>Save Task</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    priorityContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    priorityBadge: {
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: colors.white,
    },
    prioritySelected: {
        borderColor: 'transparent',
    },
    priorityText: {
        color: colors.text,
        fontWeight: '600',
    },
    button: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 40,
    },
    buttonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddTaskScreen;
