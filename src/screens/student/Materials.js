import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMaterials, uploadMaterial, recordMaterialView } from '../../services/materialService';
import { getSubjects } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { pickAndUpload } from '../../utils/uploadUtils';
import { CloudinaryFolders } from '../../services/cloudinaryService';

export default function StudentMaterialsScreen({ route }) {
    const { user } = useAuth();
    const subjectId = route?.params?.subjectId || 'all';
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
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
        loadMaterials();
    }, [subjectId]);

    const loadMaterials = async () => {
        try {
            const [materialsData, subjectsData] = await Promise.all([
                getMaterials(subjectId, 'student', user?.uid),
                getSubjects()
            ]);
            setMaterials(materialsData);
            setSubjects(subjectsData);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePickFile = async () => {
        setUploading(true);
        try {
            const result = await pickAndUpload(CloudinaryFolders.MATERIALS_STUDENT(user.uid));
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

    const handleUpload = async () => {
        if (!formData.title || !formData.cloudinaryUrl || !formData.subjectId) {
            Alert.alert('Error', 'Title, file, and subject are required');
            return;
        }

        try {
            await uploadMaterial({
                ...formData,
                uploaderId: user.uid,
                semester: parseInt(formData.semester)
            }, 'student');
            resetForm();
            loadMaterials();
            Alert.alert('Success', 'Material uploaded! Waiting for admin approval.');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', cloudinaryUrl: '', publicId: '', fileType: 'pdf', subjectId: '', semester: '1' });
        setModalVisible(false);
    };

    const handleOpenMaterial = (url, materialId) => {
        if (user?.uid && materialId) {
            recordMaterialView(user.uid, materialId);
        }
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open link');
        });
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
            return { text: 'OFFICIAL', color: '#34C759', icon: 'shield-checkmark' };
        }
        if (item.uploaderId === user?.uid) {
            if (item.approved) {
                return { text: 'APPROVED', color: '#34C759', icon: 'checkmark-circle' };
            }
            return { text: 'PENDING', color: '#FF9500', icon: 'time' };
        }
        return { text: 'STUDENT', color: '#007AFF', icon: 'person' };
    };

    const filteredMaterials = materials.filter(item => {
        const semesterMatch = filter.semester === 'all' || item.semester === parseInt(filter.semester);
        const uploadMatch = filter.uploadedBy === 'all' || item.uploadedBy === filter.uploadedBy;
        return semesterMatch && uploadMatch;
    });

    const renderMaterial = ({ item }) => {
        const subject = subjects.find(s => s.id === item.subjectId);
        const status = getStatusBadge(item);
        const isOwnUpload = item.uploaderId === user?.uid;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleOpenMaterial(item.cloudinaryUrl, item.id)}
            >
                <View style={[styles.iconBox, { backgroundColor: getTypeColor(item.fileType) + '20' }]}>
                    <Ionicons name={getTypeIcon(item.fileType)} size={32} color={getTypeColor(item.fileType)} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    {subject && <Text style={styles.subject}>{subject.name} • Sem {item.semester}</Text>}
                    {item.description && <Text style={styles.description} numberOfLines={2}>{item.description}</Text>}
                    <View style={styles.meta}>
                        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.fileType) }]}>
                            <Text style={styles.typeText}>{item.fileType?.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                            <Ionicons name={status.icon} size={12} color="#fff" />
                            <Text style={styles.statusText}>{status.text}</Text>
                        </View>
                    </View>
                    {isOwnUpload && !item.approved && item.feedback && (
                        <View style={styles.feedbackBox}>
                            <Ionicons name="information-circle" size={16} color="#FF9500" />
                            <Text style={styles.feedbackText}>{item.feedback}</Text>
                        </View>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
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
                        <Text style={[styles.filterText, filter.uploadedBy === 'admin' && styles.filterTextActive]}>Official</Text>
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
                        <Text style={styles.emptyText}>No materials available</Text>
                        <Text style={styles.emptySubtext}>Check back later for study resources</Text>
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

                            <Text style={styles.label}>Cloudinary URL *</Text>
                            <TouchableOpacity
                                style={[styles.uploadBox, formData.cloudinaryUrl && styles.uploadBoxSuccess]}
                                onPress={handlePickFile}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <Text style={styles.uploadText}>Uploading...</Text>
                                ) : formData.cloudinaryUrl ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                                        <Text style={styles.uploadTextSuccess}>File Ready</Text>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Ionicons name="cloud-upload" size={24} color="#007AFF" />
                                        <Text style={styles.uploadText}>Select & Upload File</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {formData.cloudinaryUrl && (
                                <Text style={styles.fileHint}>Type: {formData.fileType?.toUpperCase()}</Text>
                            )}

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
                            </View>
                        </ScrollView>

                        <TouchableOpacity onPress={handleUpload} style={styles.submitButton}>
                            <Text style={styles.submitText}>Upload for Review</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    subject: { fontSize: 14, color: '#666', marginBottom: 4 },
    description: { fontSize: 13, color: '#999', marginBottom: 8 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    typeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    feedbackBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, padding: 8, backgroundColor: '#FFF3CD', borderRadius: 6 },
    feedbackText: { flex: 1, fontSize: 12, color: '#856404' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 12 },
    emptySubtext: { fontSize: 14, color: '#ccc', marginTop: 4 },
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
    subjectOption: { padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#F2F2F7' },
    subjectOptionActive: { backgroundColor: '#007AFF' },
    subjectOptionText: { fontSize: 14, color: '#666' },
    subjectOptionTextActive: { color: '#fff', fontWeight: '500' },
    subjectsContainer: { marginBottom: 16 },
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
