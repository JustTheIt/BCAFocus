import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProjectInstructions, submitProject, getStudentSubmissions } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { pickAndUpload } from '../../utils/uploadUtils';
import { CloudinaryFolders } from '../../services/cloudinaryService';

export default function StudentProjectsScreen() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        cloudinaryUrl: '',
        publicId: '',
        fileType: 'zip'
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [projectsData, submissionsData] = await Promise.all([
                getProjectInstructions(user?.semester || '1'),
                getStudentSubmissions(user?.uid)
            ]);
            setProjects(projectsData);
            setSubmissions(submissionsData);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handlePickFile = async () => {
        setUploading(true);
        try {
            const result = await pickAndUpload(CloudinaryFolders.PROJECTS_SUBMISSIONS(selectedProject.id, user.uid));
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
        if (!formData.cloudinaryUrl || !selectedProject) {
            Alert.alert('Error', 'File is required');
            return;
        }

        try {
            await submitProject({
                projectId: selectedProject.id,
                studentId: user.uid,
                cloudinaryUrl: formData.cloudinaryUrl,
                publicId: formData.publicId,
                fileType: formData.fileType
            });
            resetForm();
            loadData();
            Alert.alert('Success', 'Project submitted successfully!');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const resetForm = () => {
        setFormData({ cloudinaryUrl: '', publicId: '', fileType: 'zip' });
        setSelectedProject(null);
        setModalVisible(false);
    };

    const openSubmitModal = (project) => {
        setSelectedProject(project);
        setModalVisible(true);
    };

    const getSubmissionForProject = (projectId) => {
        return submissions.find(s => s.projectId === projectId);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return { text: 'APPROVED', color: '#34C759', icon: 'checkmark-circle' };
            case 'rejected':
                return { text: 'REJECTED', color: '#FF3B30', icon: 'close-circle' };
            default:
                return { text: 'SUBMITTED', color: '#FF9500', icon: 'time' };
        }
    };

    const renderProject = ({ item }) => {
        const submission = getSubmissionForProject(item.id);
        const status = submission ? getStatusBadge(submission.status) : null;
        const isDeadlinePassed = item.deadline && new Date(item.deadline) < new Date();

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.projectIcon}>
                        <Ionicons name="folder-open" size={32} color="#007AFF" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
                        <View style={styles.meta}>
                            <View style={styles.badge}>
                                <Ionicons name="school" size={12} color="#fff" />
                                <Text style={styles.badgeText}>Sem {item.semester}</Text>
                            </View>
                            {item.deadline && (
                                <View style={[styles.badge, { backgroundColor: isDeadlinePassed ? '#FF3B30' : '#FF9500' }]}>
                                    <Ionicons name="calendar" size={12} color="#fff" />
                                    <Text style={styles.badgeText}>{new Date(item.deadline).toLocaleDateString()}</Text>
                                </View>
                            )}
                            {status && (
                                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                    <Ionicons name={status.icon} size={12} color="#fff" />
                                    <Text style={styles.statusText}>{status.text}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {submission?.feedback && (
                    <View style={[styles.feedbackBox, { backgroundColor: submission.status === 'rejected' ? '#FFEBEE' : '#E8F5E9' }]}>
                        <Ionicons name="chatbubble-ellipses" size={16} color={submission.status === 'rejected' ? '#C62828' : '#2E7D32'} />
                        <Text style={[styles.feedbackText, { color: submission.status === 'rejected' ? '#C62828' : '#2E7D32' }]}>
                            {submission.feedback}
                        </Text>
                    </View>
                )}

                <View style={styles.actions}>
                    {item.instructionsUrl && (
                        <TouchableOpacity
                            onPress={() => Linking.openURL(item.instructionsUrl)}
                            style={styles.actionBtn}
                        >
                            <Ionicons name="document-text" size={18} color="#007AFF" />
                            <Text style={styles.actionText}>Instructions</Text>
                        </TouchableOpacity>
                    )}
                    {!submission && !isDeadlinePassed && (
                        <TouchableOpacity
                            onPress={() => openSubmitModal(item)}
                            style={styles.actionBtn}
                        >
                            <Ionicons name="cloud-upload" size={18} color="#34C759" />
                            <Text style={[styles.actionText, { color: '#34C759' }]}>Submit</Text>
                        </TouchableOpacity>
                    )}
                    {submission && (
                        <TouchableOpacity
                            onPress={() => Linking.openURL(submission.cloudinaryUrl)}
                            style={styles.actionBtn}
                        >
                            <Ionicons name="download" size={18} color="#5856D6" />
                            <Text style={[styles.actionText, { color: '#5856D6' }]}>View Submission</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Projects</Text>
            </View>

            <FlatList
                data={projects}
                renderItem={renderProject}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No projects available</Text>
                        <Text style={styles.emptySubtext}>Check back later for assignments</Text>
                    </View>
                }
            />

            {/* Submit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Submit Project</Text>
                            <TouchableOpacity onPress={resetForm}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {selectedProject && (
                            <View style={styles.projectInfo}>
                                <Text style={styles.projectTitle}>{selectedProject.title}</Text>
                                <Text style={styles.projectDesc}>{selectedProject.description}</Text>
                            </View>
                        )}

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Submission File *</Text>
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
                                {['zip', 'pdf', 'link'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeOption,
                                            formData.fileType === type && styles.typeOptionActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, fileType: type })}
                                    >
                                        <Text style={[
                                            styles.typeOptionText,
                                            formData.fileType === type && styles.typeOptionTextActive
                                        ]}>
                                            {type.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitText}>Submit Project</Text>
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
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
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
    projectIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    description: { fontSize: 14, color: '#666', marginBottom: 8 },
    meta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#007AFF' },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    feedbackBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, padding: 12, borderRadius: 8 },
    feedbackText: { flex: 1, fontSize: 13 },
    actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { color: '#007AFF', fontSize: 14 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 12 },
    emptySubtext: { fontSize: 14, color: '#ccc', marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    projectInfo: { padding: 20, backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    projectTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    projectDesc: { fontSize: 14, color: '#666' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    typeOptions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    typeOption: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F2F2F7', alignItems: 'center' },
    typeOptionActive: { backgroundColor: '#007AFF' },
    typeOptionText: { fontSize: 14, color: '#666', fontWeight: '500' },
    typeOptionTextActive: { color: '#fff', fontWeight: '600' },
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
