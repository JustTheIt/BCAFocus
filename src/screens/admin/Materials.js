import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { uploadMaterial, getMaterials, deleteMaterial } from '../../services/materialService';
import { getSubjects } from '../../services/adminService';

export default function MaterialsManagementScreen() {
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        fileUrl: '',
        type: 'pdf',
        subjectId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [materialsData, subjectsData] = await Promise.all([
                getMaterials('all'), // Get all materials for admin
                getSubjects()
            ]);
            setMaterials(materialsData);
            setSubjects(subjectsData);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.fileUrl || !formData.subjectId) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        try {
            await uploadMaterial(formData);
            resetForm();
            loadData();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Material',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMaterial(id);
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
        setFormData({ title: '', fileUrl: '', type: 'pdf', subjectId: '' });
        setModalVisible(false);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf': return 'document-text';
            case 'video': return 'videocam';
            case 'link': return 'link';
            default: return 'document';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'pdf': return '#FF3B30';
            case 'video': return '#5856D6';
            case 'link': return '#007AFF';
            default: return '#666';
        }
    };

    const renderMaterial = ({ item }) => {
        const subject = subjects.find(s => s.id === item.subjectId);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                        <Ionicons name={getTypeIcon(item.type)} size={24} color={getTypeColor(item.type)} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.title}</Text>
                        {subject && <Text style={styles.subject}>{subject.name}</Text>}
                        <View style={styles.meta}>
                            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                                <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(item.fileUrl)}
                        style={styles.openBtn}
                    >
                        <Ionicons name="open-outline" size={18} color="#007AFF" />
                        <Text style={styles.openText}>Open</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Study Materials</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={materials}
                renderItem={renderMaterial}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No materials yet</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Upload Material</Text>
                            <TouchableOpacity onPress={resetForm}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                                placeholder="Material title"
                            />

                            <Text style={styles.label}>File URL *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.fileUrl}
                                onChangeText={(text) => setFormData({ ...formData, fileUrl: text })}
                                placeholder="https://..."
                            />

                            <Text style={styles.label}>Type *</Text>
                            <View style={styles.typeOptions}>
                                {['pdf', 'video', 'link'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeOption,
                                            formData.type === type && styles.typeOptionActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, type })}
                                    >
                                        <Ionicons name={getTypeIcon(type)} size={20} color={formData.type === type ? '#fff' : '#666'} />
                                        <Text style={[
                                            styles.typeOptionText,
                                            formData.type === type && styles.typeOptionTextActive
                                        ]}>
                                            {type.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Subject *</Text>
                            <ScrollView style={styles.subjectPicker} nestedScrollEnabled>
                                {subjects.map((subject) => (
                                    <TouchableOpacity
                                        key={subject.id}
                                        style={[
                                            styles.subjectOption,
                                            formData.subjectId === subject.id && styles.subjectOptionActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, subjectId: subject.id })}
                                    >
                                        <Text style={[
                                            styles.subjectOptionText,
                                            formData.subjectId === subject.id && styles.subjectOptionTextActive
                                        ]}>
                                            {subject.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitText}>Upload Material</Text>
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
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
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
    cardHeader: { flexDirection: 'row', marginBottom: 12 },
    typeIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    subject: { fontSize: 14, color: '#666', marginBottom: 8 },
    meta: { flexDirection: 'row' },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    typeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
    openBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    openText: { color: '#007AFF', fontSize: 14 },
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
    typeOptions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F2F2F7' },
    typeOptionActive: { backgroundColor: '#007AFF' },
    typeOptionText: { fontSize: 14, color: '#666' },
    typeOptionTextActive: { color: '#fff', fontWeight: '500' },
    subjectPicker: { maxHeight: 150, marginBottom: 16 },
    subjectOption: { padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#F2F2F7' },
    subjectOptionActive: { backgroundColor: '#007AFF' },
    subjectOptionText: { fontSize: 14, color: '#666' },
    subjectOptionTextActive: { color: '#fff', fontWeight: '500' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
