import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert, RefreshControl, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllStudents, updateStudentStatus, updateStudentRole, assignTaskToStudent } from '../../services/adminService';

export default function StudentsScreen() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Assign Task Modal State
    const [taskModalVisible, setTaskModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [taskData, setTaskData] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await getAllStudents();
            setStudents(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStudents();
        setRefreshing(false);
    };

    const handleToggleStatus = async (uid, currentStatus) => {
        try {
            await updateStudentStatus(uid, !currentStatus);
            setStudents(students.map(s =>
                s.uid === uid ? { ...s, active: !currentStatus } : s
            ));
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleChangeRole = (student) => {
        Alert.alert(
            'Change Role',
            `Change ${student.name || student.email}'s role?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Make Admin',
                    onPress: async () => {
                        try {
                            await updateStudentRole(student.uid, 'admin');
                            loadStudents();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                },
                {
                    text: 'Make Student',
                    onPress: async () => {
                        try {
                            await updateStudentRole(student.uid, 'student');
                            loadStudents();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const openTaskModal = (student) => {
        setSelectedStudent(student);
        setTaskData({
            title: '',
            description: '',
            dueDate: new Date().toISOString().split('T')[0],
            priority: 'medium'
        });
        setTaskModalVisible(true);
    };

    const handleAssignTask = async () => {
        if (!taskData.title) {
            Alert.alert('Error', 'Title is required');
            return;
        }
        try {
            await assignTaskToStudent(selectedStudent.uid, taskData);
            setTaskModalVisible(false);
            Alert.alert('Success', `Task assigned to ${selectedStudent.name || 'Student'}`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const renderStudent = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#007AFF" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name || 'No Name'}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <View style={styles.badges}>
                        <View style={[styles.badge, item.role === 'admin' ? styles.adminBadge : styles.studentBadge]}>
                            <Text style={styles.badgeText}>{item.role || 'student'}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.university || 'TU'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Active:</Text>
                    <Switch
                        value={item.active !== false}
                        onValueChange={() => handleToggleStatus(item.uid, item.active !== false)}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => openTaskModal(item)} style={styles.actionBtn}>
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.actionBtnText}>Assign Task</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleChangeRole(item)} style={styles.iconBtn}>
                        <Ionicons name="shield-outline" size={22} color="#5856D6" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Students</Text>
                <Text style={styles.count}>{students.length} total</Text>
            </View>

            <FlatList
                data={students}
                renderItem={renderStudent}
                keyExtractor={(item) => item.uid || item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="people-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No students yet</Text>
                    </View>
                }
            />

            <Modal visible={taskModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Assign Task</Text>
                            <TouchableOpacity onPress={() => setTaskModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalSubHeader}>
                            <Text style={styles.assigningTo}>To: {selectedStudent?.name || selectedStudent?.email}</Text>
                        </View>

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Task Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={taskData.title}
                                onChangeText={t => setTaskData({ ...taskData, title: t })}
                                placeholder="e.g. Complete Assignment 1"
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={taskData.description}
                                onChangeText={t => setTaskData({ ...taskData, description: t })}
                                placeholder="Details..."
                                multiline
                                numberOfLines={3}
                            />

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Due Date</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={taskData.dueDate}
                                        onChangeText={t => setTaskData({ ...taskData, dueDate: t })}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </View>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Priority</Text>
                                    <View style={styles.priorityRow}>
                                        {['low', 'medium', 'high'].map(p => (
                                            <TouchableOpacity
                                                key={p}
                                                style={[
                                                    styles.priorityBadge,
                                                    taskData.priority === p && styles.priorityActive,
                                                    p === 'high' && taskData.priority === 'high' && { backgroundColor: '#FF3B30' },
                                                    p === 'medium' && taskData.priority === 'medium' && { backgroundColor: '#FF9500' },
                                                    p === 'low' && taskData.priority === 'low' && { backgroundColor: '#34C759' }
                                                ]}
                                                onPress={() => setTaskData({ ...taskData, priority: p })}
                                            >
                                                <Text style={[styles.priorityText, taskData.priority === p && { color: '#fff' }]}>{p.charAt(0).toUpperCase()}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleAssignTask} style={styles.submitBtn}>
                                <Text style={styles.submitText}>Assign Task</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: { fontSize: 24, fontWeight: 'bold' },
    count: { fontSize: 14, color: '#666' },
    list: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', marginBottom: 12 },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    email: { fontSize: 14, color: '#666', marginBottom: 8 },
    badges: { flexDirection: 'row', gap: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    adminBadge: { backgroundColor: '#FFE5E5' },
    studentBadge: { backgroundColor: '#E3F2FD' },
    badgeText: { fontSize: 12, fontWeight: '500' },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
    },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusLabel: { fontSize: 14, color: '#666' },
    actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8
    },
    actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    iconBtn: { padding: 8 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 12 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalSubHeader: { paddingHorizontal: 20, paddingBottom: 10 },
    assigningTo: { fontSize: 14, color: '#666', fontStyle: 'italic' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    textArea: { height: 80, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },
    priorityRow: { flexDirection: 'row', gap: 8, height: 44, alignItems: 'center' },
    priorityBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    priorityActive: { backgroundColor: '#007AFF' },
    priorityText: { fontSize: 14, fontWeight: 'bold', color: '#666' },
    submitBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
