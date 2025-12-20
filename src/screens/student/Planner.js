import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getTasks, addTask, deleteTask, updateTask } from '../../services/plannerService';
import { getStudentAssignedTasks } from '../../services/assignedTaskService';

export default function PlannerScreen() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'assigned'

    // Personal Tasks State
    const [tasks, setTasks] = useState([]);

    // Assigned Tasks State
    const [assignedTasks, setAssignedTasks] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

    useEffect(() => {
        if (user) {
            loadTasks();
            loadAssignedTasks();
        }
    }, [user]);

    const loadTasks = async () => {
        try {
            const data = await getTasks(user.uid);
            setTasks(data);
        } catch (error) {
            console.error("Load tasks error:", error);
        }
    };

    const loadAssignedTasks = async () => {
        try {
            const data = await getStudentAssignedTasks(user.uid);
            setAssignedTasks(data);
        } catch (error) {
            console.error("Load assigned error:", error);
        }
    };

    const handleAddTask = async () => {
        if (!newTask.title) {
            Alert.alert('Error', 'Title is required');
            return;
        }

        try {
            await addTask(user.uid, newTask);
            setModalVisible(false);
            setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
            loadTasks();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await deleteTask(id);
            loadTasks();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            await updateTask(task.id, { completed: !task.completed });
            loadTasks();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#FF3B30';
            case 'medium': return '#FF9500';
            case 'low': return '#34C759';
            default: return '#999';
        }
    };

    const renderTask = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => handleToggleComplete(item)} style={styles.checkCircle}>
                {item.completed && <Ionicons name="checkmark" size={18} color="#fff" />}
            </TouchableOpacity>

            <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.completed && styles.completedText]}>{item.title}</Text>
                {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
                <View style={styles.metaRow}>
                    <Text style={[styles.priority, { color: getPriorityColor(item.priority) }]}>
                        {item.priority?.toUpperCase()}
                    </Text>
                    {item.dueDate && <Text style={styles.date}>Due: {item.dueDate}</Text>}
                </View>
            </View>

            <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );

    const renderAssignedTask = ({ item }) => (
        <View style={[styles.card, styles.assignedCard]}>
            <View style={styles.assignedBadge}>
                <Ionicons name="person-circle" size={20} color="#5856D6" />
                <Text style={styles.assignedText}>Assigned by Admin</Text>
            </View>

            <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
                <View style={styles.metaRow}>
                    <Text style={[styles.priority, { color: getPriorityColor(item.priority) }]}>
                        {item.priority?.toUpperCase()}
                    </Text>
                    {item.dueDate && <Text style={styles.date}>Due: {item.dueDate}</Text>}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Planner</Text>
                {activeTab === 'personal' && (
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                        <Ionicons name="add" size={24} color="#007AFF" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
                    onPress={() => setActiveTab('personal')}
                >
                    <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>My Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
                    onPress={() => setActiveTab('assigned')}
                >
                    <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
                        Assigned {assignedTasks.length > 0 && `(${assignedTasks.length})`}
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'personal' ? (
                <FlatList
                    data={tasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="create-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No tasks yet</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={assignedTasks}
                    renderItem={renderAssignedTask}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="checkmark-done-circle-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No assigned tasks</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Task</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.form}>
                            <TextInput
                                style={styles.input}
                                value={newTask.title}
                                onChangeText={t => setNewTask({ ...newTask, title: t })}
                                placeholder="Task Title"
                            />
                            <TextInput
                                style={styles.input}
                                value={newTask.description}
                                onChangeText={t => setNewTask({ ...newTask, description: t })}
                                placeholder="Description (optional)"
                            />
                            <TextInput
                                style={styles.input}
                                value={newTask.dueDate}
                                onChangeText={t => setNewTask({ ...newTask, dueDate: t })}
                                placeholder="Due Date (YYYY-MM-DD)"
                            />

                            <View style={styles.prioritySelector}>
                                {['low', 'medium', 'high'].map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.pBadge,
                                            newTask.priority === p && styles.pActive,
                                            newTask.priority === p && { backgroundColor: getPriorityColor(p) }
                                        ]}
                                        onPress={() => setNewTask({ ...newTask, priority: p })}
                                    >
                                        <Text style={[styles.pText, newTask.priority === p && { color: '#fff' }]}>
                                            {p.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity onPress={handleAddTask} style={styles.submitBtn}>
                                <Text style={styles.submitText}>Add Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    addBtn: { padding: 4 },
    tabs: { flexDirection: 'row', padding: 16, gap: 12 },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#fff' },
    activeTab: { backgroundColor: '#007AFF' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
    activeTabText: { color: '#fff' },
    list: { padding: 16 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
    assignedCard: { borderLeftWidth: 4, borderLeftColor: '#5856D6', flexDirection: 'column', alignItems: 'flex-start' },
    assignedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, backgroundColor: '#F2F2F7', padding: 4, borderRadius: 6 },
    assignedText: { fontSize: 12, fontWeight: '600', color: '#5856D6' },
    checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#007AFF', marginRight: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    taskInfo: { flex: 1 },
    taskTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    completedText: { textDecorationLine: 'line-through', color: '#ccc' },
    taskDesc: { fontSize: 14, color: '#666', marginBottom: 8 },
    metaRow: { flexDirection: 'row', gap: 12 },
    priority: { fontSize: 12, fontWeight: '600' },
    date: { fontSize: 12, color: '#999' },
    deleteBtn: { padding: 8 },
    empty: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#ccc', marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    input: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, marginBottom: 16 },
    prioritySelector: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    pBadge: { padding: 8, borderRadius: 8, backgroundColor: '#eee' },
    pText: { fontSize: 12, fontWeight: '600', color: '#666' },
    submitBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontWeight: 'bold' }
});
