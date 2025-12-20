import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUniversities, addUniversity, updateUniversity, deleteUniversity } from '../../services/adminService';

export default function UniversitiesScreen() {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        uniId: '',
        totalCredits: '',
        core: '',
        elective: '',
        math: '',
        language: '',
        projects: ''
    });

    useEffect(() => {
        loadUniversities();
    }, []);

    const loadUniversities = async () => {
        try {
            const data = await getUniversities();
            setUniversities(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.uniId) {
            Alert.alert('Error', 'Name and ID are required');
            return;
        }

        try {
            const uniData = {
                name: formData.name,
                uniId: formData.uniId,
                totalCredits: parseInt(formData.totalCredits) || 0,
                creditBreakdown: {
                    core: parseInt(formData.core) || 0,
                    elective: parseInt(formData.elective) || 0,
                    math: parseInt(formData.math) || 0,
                    language: parseInt(formData.language) || 0,
                    projects: parseInt(formData.projects) || 0
                }
            };

            if (editingId) {
                await updateUniversity(editingId, uniData);
            } else {
                await addUniversity(uniData);
            }

            resetForm();
            loadUniversities();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleEdit = (uni) => {
        setEditingId(uni.id);
        setFormData({
            name: uni.name,
            uniId: uni.uniId,
            totalCredits: uni.totalCredits?.toString() || '',
            core: uni.creditBreakdown?.core?.toString() || '',
            elective: uni.creditBreakdown?.elective?.toString() || '',
            math: uni.creditBreakdown?.math?.toString() || '',
            language: uni.creditBreakdown?.language?.toString() || '',
            projects: uni.creditBreakdown?.projects?.toString() || ''
        });
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete University',
            'Are you sure you want to delete this university?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUniversity(id);
                            loadUniversities();
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
            uniId: '',
            totalCredits: '',
            core: '',
            elective: '',
            math: '',
            language: '',
            projects: ''
        });
        setEditingId(null);
        setModalVisible(false);
    };

    const renderUniversity = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.uniName}>{item.name}</Text>
                <Text style={styles.uniId}>{item.uniId}</Text>
            </View>
            <Text style={styles.credits}>Total Credits: {item.totalCredits || 0}</Text>
            <View style={styles.breakdown}>
                <Text style={styles.breakdownText}>Core: {item.creditBreakdown?.core || 0}</Text>
                <Text style={styles.breakdownText}>Elective: {item.creditBreakdown?.elective || 0}</Text>
                <Text style={styles.breakdownText}>Math: {item.creditBreakdown?.math || 0}</Text>
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
                <Text style={styles.title}>Universities</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={universities}
                renderItem={renderUniversity}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="school-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No universities yet</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingId ? 'Edit University' : 'Add University'}
                            </Text>
                            <TouchableOpacity onPress={resetForm}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>University Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="e.g., Tribhuvan University"
                            />

                            <Text style={styles.label}>University ID *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.uniId}
                                onChangeText={(text) => setFormData({ ...formData, uniId: text })}
                                placeholder="e.g., TU"
                            />

                            <Text style={styles.label}>Total Credits</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.totalCredits}
                                onChangeText={(text) => setFormData({ ...formData, totalCredits: text })}
                                placeholder="e.g., 126"
                                keyboardType="numeric"
                            />

                            <Text style={styles.sectionTitle}>Credit Breakdown</Text>

                            <Text style={styles.label}>Core Credits</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.core}
                                onChangeText={(text) => setFormData({ ...formData, core: text })}
                                placeholder="e.g., 96"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Elective Credits</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.elective}
                                onChangeText={(text) => setFormData({ ...formData, elective: text })}
                                placeholder="e.g., 6"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Math Credits</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.math}
                                onChangeText={(text) => setFormData({ ...formData, math: text })}
                                placeholder="e.g., 6"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Language Credits</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.language}
                                onChangeText={(text) => setFormData({ ...formData, language: text })}
                                placeholder="e.g., 6"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Project Credits</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.projects}
                                onChangeText={(text) => setFormData({ ...formData, projects: text })}
                                placeholder="e.g., 12"
                                keyboardType="numeric"
                            />
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitText}>
                                {editingId ? 'Update' : 'Add'} University
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
    uniName: { fontSize: 18, fontWeight: '600', flex: 1 },
    uniId: { fontSize: 14, color: '#666', backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    credits: { fontSize: 14, color: '#666', marginBottom: 8 },
    breakdown: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    breakdownText: { fontSize: 12, color: '#666' },
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
    sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 12, color: '#000' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
