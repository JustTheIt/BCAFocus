import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { uploadMaterial, getMaterials, deleteMaterial, approveMaterial, rejectMaterial } from '../../services/materialService';
import { getSubjects } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { pickAndUpload } from '../../utils/uploadUtils';
import { CloudinaryFolders } from '../../services/cloudinaryService';

export default function MaterialsManagementScreen() {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, materialId: null, feedback: '' });
    const [filter, setFilter] = useState({ semester: 'all', uploadedBy: 'all' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cloudinaryUrl: '',
        publicId: '',
        fileType: 'pdf',
        subjectId: '',
        semester: '1'
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [materialsData, subjectsData] = await Promise.all([
                getMaterials('all', 'admin'), // Get all materials for admin
                getSubjects()
            ]);
            setMaterials(materialsData);
            setSubjects(subjectsData);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handlePickFile = async () => {
        setUploading(true);
        try {
            const result = await pickAndUpload(CloudinaryFolders.MATERIALS_ADMIN);
            if (result) {
                setFormData({
                    ...formData,
                    cloudinaryUrl: result.url,
                    publicId: result.publicId,
                    fileType: result.fileType
                });
                Alert.alert('Success', 'File uploaded successfully!');
            }
        } catch (error) {
            // Error handled by pickAndUpload
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.cloudinaryUrl || !formData.subjectId) {
            Alert.alert('Error', 'Title, file, and subject are required');
            return;
        }

        try {
            await uploadMaterial({
                ...formData,
                uploaderId: user.uid,
                semester: parseInt(formData.semester)
            }, 'admin');
            resetForm();
            loadData();
            Alert.alert('Success', 'Material uploaded successfully');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleApprove = async (materialId) => {
        try {
            await approveMaterial(materialId);
            loadData();
            Alert.alert('Success', 'Material approved');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleReject = (materialId) => {
        setFeedbackModal({ visible: true, materialId, feedback: '' });
    };

    const submitRejection = async () => {
        try {
            await rejectMaterial(feedbackModal.materialId);
            setFeedbackModal({ visible: false, materialId: null, feedback: '' });
            loadData();
            Alert.alert('Success', 'Material rejected and deleted');
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
        setFormData({ title: '', description: '', cloudinaryUrl: '', publicId: '', fileType: 'pdf', subjectId: '', semester: '1' });
        setModalVisible(false);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf': return 'document-text';
            case 'video': return 'videocam';
            case 'link': return 'link';
            case 'zip': return 'archive';
            case 'ppt': return 'easel';
            default: return 'document';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'pdf': return '#FF3B30';
            case 'video': return '#5856D6';
            case 'link': return '#007AFF';
            case 'zip': return '#FF9500';
            case 'ppt': return '#FF2D55';
            default: return '#666';
        }
    };

    const getStatusBadge = (item) => {
        if (item.uploadedBy === 'admin') {
            return { text: 'ADMIN', color: '#34C759' };
        }
        if (item.approved) {
            return { text: 'APPROVED', color: '#34C759' };
        }
        return { text: 'PENDING', color: '#FF9500' };
    };

    const filteredMaterials = materials.filter(item => {
        const semesterMatch = filter.semester === 'all' || item.semester === parseInt(filter.semester);
        const uploadMatch = filter.uploadedBy === 'all' || item.uploadedBy === filter.uploadedBy;
        return semesterMatch && uploadMatch;
    });

    const renderMaterial = ({ item }) => {
        const subject = subjects.find(s => s.id === item.subjectId);
        const status = getStatusBadge(item);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.fileType) + '20' }]}>
                        <Ionicons name={getTypeIcon(item.fileType)} size={24} color={getTypeColor(item.fileType)} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.title}</Text>
                        {subject && <Text style={styles.subject}>{subject.name} • Sem {item.semester}</Text>}
                        <View style={styles.meta}>
                            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.fileType) }]}>
                                <Text style={styles.typeText}>{item.fileType?.toUpperCase()}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                <Text style={styles.statusText}>{status.text}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(item.cloudinaryUrl)}
                        style={styles.actionBtn}
                    >
                        <Ionicons name="open-outline" size={18} color="#007AFF" />
                        <Text style={styles.actionText}>Open</Text>
                    </TouchableOpacity>

                    {item.uploadedBy === 'student' && !item.approved && (
                        <TouchableOpacity onPress={() => handleApprove(item.id)} style={styles.actionBtn}>
                            <Ionicons name="checkmark-circle-outline" size={18} color="#34C759" />
                            <Text style={[styles.actionText, { color: '#34C759' }]}>Approve</Text>
                        </TouchableOpacity>
                    )}
                    {item.uploadedBy === 'student' && !item.approved && (
                        <TouchableOpacity onPress={() => handleReject(item.id)} style={styles.actionBtn}>
                            <Ionicons name="close-circle-outline" size={18} color="#FF9500" />
                            <Text style={[styles.actionText, { color: '#FF9500' }]}>Reject</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
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

            {/* Filters */}
            <View style={styles.filters}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.filterChip, filter.semester === 'all' && styles.filterChipActive]}
                        onPress={() => setFilter({ ...filter, semester: 'all' })}
                    >
                        <Text style={[styles.filterText, filter.semester === 'all' && styles.filterTextActive]}>All Semesters</Text>
                    </TouchableOpacity>
                    {[1, 2, 3, 4, 5, 6].map(sem => (
                        <TouchableOpacity
                            key={sem}
                            style={[styles.filterChip, filter.semester === sem.toString() && styles.filterChipActive]}
                            onPress={() => setFilter({ ...filter, semester: sem.toString() })}
                        >
                            <Text style={[styles.filterText, filter.semester === sem.toString() && styles.filterTextActive]}>Sem {sem}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    <TouchableOpacity
                        style={[styles.filterChip, filter.uploadedBy === 'all' && styles.filterChipActive]}
                        onPress={() => setFilter({ ...filter, uploadedBy: 'all' })}
                    >
                        <Text style={[styles.filterText, filter.uploadedBy === 'all' && styles.filterTextActive]}>All Sources</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filter.uploadedBy === 'admin' && styles.filterChipActive]}
                        onPress={() => setFilter({ ...filter, uploadedBy: 'admin' })}
                    >
                        <Text style={[styles.filterText, filter.uploadedBy === 'admin' && styles.filterTextActive]}>Admin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filter.uploadedBy === 'student' && styles.filterChipActive]}
                        onPress={() => setFilter({ ...filter, uploadedBy: 'student' })}
                    >
                        <Text style={[styles.filterText, filter.uploadedBy === 'student' && styles.filterTextActive]}>Student</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <FlatList
                data={filteredMaterials}
                renderItem={renderMaterial}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No materials found</Text>
                    </View>
                }
            />

            {/* Upload Modal */}
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

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Brief description"
                                multiline
                            />

                            <Text style={styles.label}>Material File *</Text>
                            <TouchableOpacity
                                style={[styles.uploadBox, formData.cloudinaryUrl && styles.uploadBoxSuccess]}
                                onPress={handlePickFile}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <Text style={styles.uploadText}>Uploading...</Text>
                                ) : formData.cloudinaryUrl ? (
                                    <>
                                        <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                                        <Text style={styles.uploadTextSuccess}>File Ready</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload" size={24} color="#007AFF" />
                                        <Text style={styles.uploadText}>Select & Upload File</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {formData.cloudinaryUrl && (
                                <Text style={styles.fileHint}>Type: {formData.fileType?.toUpperCase()}</Text>
                            )}

                            <View style={{ marginBottom: 16 }} />

                            <Text style={styles.label}>File Type *</Text>
                            <View style={styles.typeOptions}>
                                {['pdf', 'ppt', 'zip', 'video', 'link'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeOption,
                                            formData.fileType === type && styles.typeOptionActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, fileType: type })}
                                    >
                                        <Ionicons name={getTypeIcon(type)} size={20} color={formData.fileType === type ? '#fff' : '#666'} />
                                        <Text style={[
                                            styles.typeOptionText,
                                            formData.fileType === type && styles.typeOptionTextActive
                                        ]}>
                                            {type.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Semester *</Text>
                            <View style={styles.semesterOptions}>
                                {[1, 2, 3, 4, 5, 6].map((sem) => (
                                    <TouchableOpacity
                                        key={sem}
                                        style={[
                                            styles.semesterOption,
                                            formData.semester === sem.toString() && styles.semesterOptionActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, semester: sem.toString() })}
                                    >
                                        <Text style={[
                                            styles.semesterOptionText,
                                            formData.semester === sem.toString() && styles.semesterOptionTextActive
                                        ]}>
                                            {sem}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Subject *</Text>
                            <View style={styles.subjectsContainer}>
                                {subjects.filter(s => s.semester === parseInt(formData.semester)).map((subject) => (
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
                                {subjects.filter(s => s.semester === parseInt(formData.semester)).length === 0 && (
                                    <Text style={styles.emptyText}>No subjects found for this semester</Text>
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitText}>Upload Material</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal visible={feedbackModal.visible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '50%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Reject Material</Text>
                            <TouchableOpacity onPress={() => setFeedbackModal({ visible: false, materialId: null, feedback: '' })}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.form}>
                            <Text style={styles.label}>Feedback (Optional)</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                value={feedbackModal.feedback}
                                onChangeText={(text) => setFeedbackModal({ ...feedbackModal, feedback: text })}
                                placeholder="Reason for rejection..."
                                multiline
                            />
                        </View>
                        <TouchableOpacity onPress={submitRejection} style={[styles.submitButton, { backgroundColor: '#FF3B30' }]}>
                            <Text style={styles.submitText}>Reject & Delete</Text>
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
    filters: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F7', marginRight: 8 },
    filterChipActive: { backgroundColor: '#007AFF' },
    filterText: { fontSize: 14, color: '#666' },
    filterTextActive: { color: '#fff', fontWeight: '500' },
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
    meta: { flexDirection: 'row', gap: 8 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    typeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12, flexWrap: 'wrap' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { color: '#007AFF', fontSize: 14 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    typeOptions: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    typeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F2F2F7' },
    typeOptionActive: { backgroundColor: '#007AFF' },
    typeOptionText: { fontSize: 12, color: '#666' },
    typeOptionTextActive: { color: '#fff', fontWeight: '500' },
    semesterOptions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    semesterOption: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    semesterOptionActive: { backgroundColor: '#007AFF' },
    semesterOptionText: { fontSize: 16, color: '#666', fontWeight: '500' },
    semesterOptionTextActive: { color: '#fff', fontWeight: '600' },
    semesterOptionTextActive: { color: '#fff', fontWeight: '600' },
    subjectsContainer: { marginBottom: 16 },
    subjectOption: { padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#F2F2F7' },
    subjectOptionActive: { backgroundColor: '#007AFF' },
    subjectOptionText: { fontSize: 14, color: '#666' },
    subjectOptionTextActive: { color: '#fff', fontWeight: '500' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    uploadBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#007AFF',
        marginBottom: 8,
    },
    uploadBoxSuccess: {
        borderColor: '#34C759',
        backgroundColor: '#F2F9F4',
    },
    uploadText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
    uploadTextSuccess: { color: '#34C759', fontSize: 16, fontWeight: '500' },
    fileHint: { fontSize: 12, color: '#666', marginLeft: 4, marginBottom: 16 },
});
