import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Picker } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../../services/adminService';
import { getUniversities } from '../../services/adminService';

export default function SubjectsScreen() {
    const [subjects, setSubjects] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        creditHours: '',
        description: '',
        uniId: '',
        semesterId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [subjectsData, universitiesData] = await Promise.all([
                getSubjects(),
                getUniversities()
            ]);
            setSubjects(subjectsData);
            setUniversities(universitiesData);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.code) {
            Alert.alert('Error', 'Name and code are required');
            return;
        }

        try {
            const subjectData = {
                name: formData.name,
                code: formData.code,
                creditHours: parseInt(formData.creditHours) || 3,
                description: formData.description,
                uniId: formData.uniId,
                semesterId: formData.semesterId
            };

            if (editingId) {
                await updateSubject(editingId, subjectData);
            } else {
                await addSubject(subjectData);
            }

            resetForm();
            loadData();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleEdit = (subject) => {
        setEditingId(subject.id);
        setFormData({
            name: subject.name || '',
            code: subject.code || '',
            creditHours: subject.creditHours?.toString() || '',
            description: subject.description || '',
            uniId: subject.uniId || '',
            semesterId: subject.semesterId || ''
        });
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Subject',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSubject(id);
                            loadData();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            creditHours: '',
            description: '',
            uniId: '',
            semesterId: ''
        });
        setEditingId(null);
        setModalVisible(false);
    };

    const renderSubject = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.codeBox}>
                    <Text style={styles.code}>{item.code}</Text>
                </View>
                <Text style={styles.credits}>{item.creditHours || 3} Credits</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            {item.description && <Text style={styles.description}>{item.description}</Text>}
            <View style={styles.meta}>
                {item.uniId && <Text style={styles.metaText}>University: {item.uniId}</Text>}
                {item.semesterId && <Text style={styles.metaText}>Semester: {item.semesterId}</Text>}
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                    <Ionicons name="create-outline" size={20} color="#007AFF" />
                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Subjects</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={subjects}
                renderItem={renderSubject}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="book-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No subjects yet</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingId ? 'Edit Subject' : 'Add Subject'}
                            </Text>
                            <TouchableOpacity onPress={resetForm}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Subject Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="e.g., Data Structures"
                            />

                            <Text style={styles.label}>Subject Code *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.code}
                                onChangeText={(text) => setFormData({ ...formData, code: text })}
                                placeholder="e.g., CACS201"
                            />

                            <Text style={styles.label}>Credit Hours</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.creditHours}
                                onChangeText={(text) => setFormData({ ...formData, creditHours: text })}
                                placeholder="e.g., 3"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Subject description..."
                                multiline
                                numberOfLines={3}
                            />

                            <Text style={styles.label}>University ID</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.uniId}
                                onChangeText={(text) => setFormData({ ...formData, uniId: text })}
                                placeholder="e.g., TU"
                            />

                            <Text style={styles.label}>Semester ID</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.semesterId}
                                onChangeText={(text) => setFormData({ ...formData, semesterId: text })}
                                placeholder="e.g., 1"
                            />
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitText}>
                                {editingId ? 'Update' : 'Add'} Subject
                            </Text>
                        </TouchableOpacity>
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
    addButton: { padding: 4 },
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    codeBox: { backgroundColor: '#5856D6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    code: { color: '#fff', fontWeight: '600', fontSize: 12 },
    credits: { fontSize: 14, color: '#666' },
    name: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    description: { fontSize: 14, color: '#666', marginBottom: 8 },
    meta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    metaText: { fontSize: 12, color: '#999' },
    actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    editText: { color: '#007AFF', fontSize: 14 },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    deleteText: { color: '#FF3B30', fontSize: 14 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    textArea: { height: 80, textAlignVertical: 'top' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
