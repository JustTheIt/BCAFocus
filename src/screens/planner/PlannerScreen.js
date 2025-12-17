import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getTasks, deleteTask, updateTask } from '../../services/plannerService';
import colors from '../../constants/colors';

const PlannerScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const fetchedTasks = await getTasks(user.uid);
            setTasks(fetchedTasks);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load tasks.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [user.uid])
    );

    const handleDelete = async (id) => {
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteTask(id);
                        fetchTasks(); // Refresh
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete task.');
                    }
                }
            }
        ]);
    };

    const toggleComplete = async (task) => {
        try {
            await updateTask(task.id, { completed: !task.completed });
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return colors.error;
            case 'Medium': return colors.warning;
            case 'Low': return colors.success;
            default: return colors.gray;
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.checkContainer}>
                <Ionicons
                    name={item.completed ? "checkbox" : "square-outline"}
                    size={24}
                    color={item.completed ? colors.success : colors.gray}
                />
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                <Text style={[styles.title, item.completed && styles.completedText]}>{item.title}</Text>
                {item.description ? <Text style={styles.description} numberOfLines={1}>{item.description}</Text> : null}

                <View style={styles.metaContainer}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                        <Text style={styles.priorityText}>{item.priority}</Text>
                    </View>
                    <Text style={styles.date}>{item.dueDate}</Text>
                </View>
            </View>

            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>No tasks yet. Add one!</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTask')}
            >
                <Ionicons name="add" size={30} color={colors.white} />
            </TouchableOpacity>
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
        paddingBottom: 80,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    checkContainer: {
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: colors.gray,
    },
    description: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    priorityText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        color: colors.gray,
    },
    deleteButton: {
        padding: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    emptyText: {
        color: colors.gray,
        fontSize: 16,
    },
});

export default PlannerScreen;
