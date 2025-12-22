import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCareerResources, addCareerResource, updateCareerResource, deleteCareerResource } from '../../services/careerService';
import { useAuth } from '../../context/AuthContext';

export default function CareerManagementScreen() {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'roadmap',
        url: '',
        category: 'Development'
    });

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            const data = await getCareerResources();
            setResources(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load career resources');
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            Alert.alert('Error', 'Title and description are required');
            return;
        }

        setLoading(true);
        try {
            if (editingResource) {
                await updateCareerResource(editingResource.id, formData);
                Alert.alert('Success', 'Resource updated successfully');
            } else {
                await addCareerResource({
                    ...formData,
                    createdBy: user.uid
                });
                Alert.alert('Success', 'Resource added successfully');
            }
            resetForm();
            loadResources();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setFormData({
            title: resource.title,
            description: resource.description,
            type: resource.type || 'roadmap',
            url: resource.url || '',
            category: resource.category || 'Development'
        });
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Resource',
            'Are you sure you want to delete this resource?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCareerResource(id);
                            loadResources();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete resource');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', type: 'roadmap', url: '', category: 'Development' });
        setEditingResource(null);
        setModalVisible(false);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'roadmap': return 'map-outline';
            case 'guide': return 'book-outline';
            case 'job': return 'briefcase-outline';
            case 'video': return 'videocam-outline';
            default: return 'document-text-outline';
        }
    };

    const renderResource = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name={getTypeIcon(item.type)} size={28} color="#007AFF" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.category}>{item.category} • {item.type.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <View style={styles.actions}>
                {item.url ? (
                    <TouchableOpacity onPress={() => Linking.openURL(item.url)} style={styles.actionBtn}>
                        <Ionicons name="link-outline" size={18} color="#007AFF" />
                        <Text style={styles.actionText}>Link</Text>
                    </TouchableOpacity>
                ) : null}
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={18} color="#5856D6" />
                    <Text style={[styles.actionText, { color: '#5856D6' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Career Resources</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={resources}
                renderItem={renderResource}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="briefcase-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No career resources yet</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingResource ? 'Edit' : 'Add'} Resource</Text>
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
                                placeholder="e.g., Full Stack Roadmap"
                            />

                            <Text style={styles.label}>Description *</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Describe the resource..."
                                multiline
                            />

                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeOptions}>
                                {['roadmap', 'guide', 'job', 'video'].map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeOption, formData.type === t && styles.typeOptionActive]}
                                        onPress={() => setFormData({ ...formData, type: t })}
                                    >
                                        <Text style={[styles.typeOptionText, formData.type === t && styles.typeOptionTextActive]}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Category</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.category}
                                onChangeText={(text) => setFormData({ ...formData, category: text })}
                                placeholder="e.g., Development, Design, AI"
                            />

                            <Text style={styles.label}>URL (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.url}
                                onChangeText={(text) => setFormData({ ...formData, url: text })}
                                placeholder="https://..."
                            />
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                            <Text style={styles.submitText}>{loading ? 'Saving...' : 'Save Resource'}</Text>
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
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#007AFF10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: '#000' },
    category: { fontSize: 12, color: '#666', marginTop: 2 },
    description: { fontSize: 14, color: '#444', marginBottom: 16 },
    actions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    typeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    typeOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F7' },
    typeOptionActive: { backgroundColor: '#007AFF' },
    typeOptionText: { fontSize: 13, color: '#666' },
    typeOptionTextActive: { color: '#fff', fontWeight: '600' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
