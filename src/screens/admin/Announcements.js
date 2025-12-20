import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAnnouncements, addAnnouncement, deleteAnnouncement } from '../../services/adminService';

export default function AnnouncementsScreen() {
    const [announcements, setAnnouncements] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target: 'all'
    });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            Alert.alert('Error', 'Title and description are required');
            return;
        }

        try {
            await addAnnouncement(formData);
            resetForm();
            loadAnnouncements();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Announcement',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAnnouncement(id);
                            loadAnnouncements();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', target: 'all' });
        setModalVisible(false);
    };

    const renderAnnouncement = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                    <Ionicons name="megaphone" size={20} color="#FF9500" />
                </View>
                <View style={styles.targetBadge}>
                    <Text style={styles.targetText}>{item.target || 'all'}</Text>
                </View>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            {item.createdAt && (
                <Text style={styles.date}>
                    {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
                </Text>
            )}
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Announcements</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={announcements}
                renderItem={renderAnnouncement}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="megaphone-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No announcements yet</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Announcement</Text>
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
                                placeholder="Announcement title"
                            />

                            <Text style={styles.label}>Description *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Announcement details..."
                                multiline
                                numberOfLines={5}
                            />

                            <Text style={styles.label}>Target Audience</Text>
                            <View style={styles.targetOptions}>
                                {['all', 'TU', 'PU', 'Purbanchal'].map((target) => (
                                    <TouchableOpacity
                                        key={target}
                                        style={[
                                            styles.targetOption,
                                            formData.target === target && styles.targetOptionActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, target })}
                                    >
                                        <Text style={[
                                            styles.targetOptionText,
                                            formData.target === target && styles.targetOptionTextActive
                                        ]}>
                                            {target}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitText}>Post Announcement</Text>
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    targetText: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    description: { fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 20 },
    date: { fontSize: 12, color: '#999', marginBottom: 12 },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
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
    textArea: { height: 120, textAlignVertical: 'top' },
    targetOptions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
    targetOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#E5E5EA' },
    targetOptionActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    targetOptionText: { fontSize: 14, color: '#666' },
    targetOptionTextActive: { color: '#fff', fontWeight: '500' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
