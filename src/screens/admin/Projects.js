import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProjectInstructions, getProjectSubmissions, updateSubmissionStatus } from '../../services/projectService';
import { addProject } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export default function AdminProjectsScreen() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [submissionsModal, setSubmissionsModal] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, submissionId: null, feedback: '', status: '' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        semester: '1',
        deadline: '',
        instructionsUrl: ''
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const projectsData = await getProjectInstructions('all');
            setProjects(projectsData);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const loadSubmissions = async (projectId) => {
        try {
            const submissionsData = await getProjectSubmissions(projectId);
            setSubmissions(submissionsData);
            setSelectedProject(projectId);
            setSubmissionsModal(true);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleCreateProject = async () => {
        if (!formData.title || !formData.description || !formData.semester) {
            Alert.alert('Error', 'Title, description, and semester are required');
            return;
        }

        try {
            await addProject({
                ...formData,
                semester: parseInt(formData.semester),
                createdBy: user.uid
            });
            resetForm();
            loadProjects();
            Alert.alert('Success', 'Project created successfully');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleReview = (submissionId, status) => {
        setFeedbackModal({ visible: true, submissionId, feedback: '', status });
    };

    const submitReview = async () => {
        try {
            await updateSubmissionStatus(feedbackModal.submissionId, feedbackModal.status, feedbackModal.feedback);
            setFeedbackModal({ visible: false, submissionId: null, feedback: '', status: '' });
            loadSubmissions(selectedProject);
            Alert.alert('Success', `Submission ${feedbackModal.status}`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', semester: '1', deadline: '', instructionsUrl: '' });
        setModalVisible(false);
    };

    const renderProject = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.projectIcon}>
                        <Ionicons name="folder-open" size={32} color="#007AFF" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                        <View style={styles.meta}>
                            <View style={styles.badge}>
                                <Ionicons name="school" size={12} color="#fff" />
                                <Text style={styles.badgeText}>Sem {item.semester}</Text>
                            </View>
                            {item.deadline && (
                                <View style={[styles.badge, { backgroundColor: '#FF9500' }]}>
                                    <Ionicons name="calendar" size={12} color="#fff" />
                                    <Text style={styles.badgeText}>{new Date(item.deadline).toLocaleDateString()}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
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
                    <TouchableOpacity
                        onPress={() => loadSubmissions(item.id)}
                        style={styles.actionBtn}
                    >
                        <Ionicons name="people" size={18} color="#34C759" />
                        <Text style={[styles.actionText, { color: '#34C759' }]}>Submissions</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderSubmission = ({ item }) => {
        const statusColor = item.status === 'approved' ? '#34C759' : item.status === 'rejected' ? '#FF3B30' : '#FF9500';

        return (
            <View style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                    <Ionicons name="person-circle" size={40} color="#007AFF" />
                    <View style={styles.submissionInfo}>
                        <Text style={styles.submissionStudent}>Student ID: {item.studentId.substring(0, 8)}...</Text>
                        <Text style={styles.submissionDate}>
                            {item.submittedAt?.toDate ? new Date(item.submittedAt.toDate()).toLocaleDateString() : 'N/A'}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.submissionActions}>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(item.cloudinaryUrl)}
                        style={styles.actionBtn}
                    >
                        <Ionicons name="download" size={18} color="#007AFF" />
                        <Text style={styles.actionText}>Download</Text>
                    </TouchableOpacity>
                    {item.status !== 'approved' && (
                        <TouchableOpacity
                            onPress={() => handleReview(item.id, 'approved')}
                            style={styles.actionBtn}
                        >
                            <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                            <Text style={[styles.actionText, { color: '#34C759' }]}>Approve</Text>
                        </TouchableOpacity>
                    )}
                    {item.status !== 'rejected' && (
                        <TouchableOpacity
                            onPress={() => handleReview(item.id, 'rejected')}
                            style={styles.actionBtn}
                        >
                            <Ionicons name="close-circle" size={18} color="#FF3B30" />
                            <Text style={[styles.actionText, { color: '#FF3B30' }]}>Reject</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {item.feedback && (
                    <View style={styles.feedbackBox}>
                        <Text style={styles.feedbackLabel}>Feedback:</Text>
                        <Text style={styles.feedbackText}>{item.feedback}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Projects</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={projects}
                renderItem={renderProject}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No projects yet</Text>
                    </View>
                }
            />

            {/* Create Project Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Project</Text>
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
                                placeholder="Project title"
                            />

                            <Text style={styles.label}>Description *</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Project description"
                                multiline
                            />

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

                            <Text style={styles.label}>Deadline</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.deadline}
                                onChangeText={(text) => setFormData({ ...formData, deadline: text })}
                                placeholder="YYYY-MM-DD"
                            />

                            <Text style={styles.label}>Instructions URL</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.instructionsUrl}
                                onChangeText={(text) => setFormData({ ...formData, instructionsUrl: text })}
                                placeholder="https://res.cloudinary.com/..."
                            />
                        </ScrollView>

                        <TouchableOpacity onPress={handleCreateProject} style={styles.submitButton}>
                            <Text style={styles.submitText}>Create Project</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Submissions Modal */}
            <Modal visible={submissionsModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Student Submissions</Text>
                            <TouchableOpacity onPress={() => setSubmissionsModal(false)}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={submissions}
                            renderItem={renderSubmission}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.submissionsList}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <Ionicons name="document-outline" size={64} color="#ccc" />
                                    <Text style={styles.emptyText}>No submissions yet</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal visible={feedbackModal.visible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '50%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{feedbackModal.status === 'approved' ? 'Approve' : 'Reject'} Submission</Text>
                            <TouchableOpacity onPress={() => setFeedbackModal({ visible: false, submissionId: null, feedback: '', status: '' })}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.form}>
                            <Text style={styles.label}>Feedback</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                value={feedbackModal.feedback}
                                onChangeText={(text) => setFeedbackModal({ ...feedbackModal, feedback: text })}
                                placeholder="Add feedback for student..."
                                multiline
                            />
                        </View>
                        <TouchableOpacity
                            onPress={submitReview}
                            style={[styles.submitButton, { backgroundColor: feedbackModal.status === 'approved' ? '#34C759' : '#FF3B30' }]}
                        >
                            <Text style={styles.submitText}>{feedbackModal.status === 'approved' ? 'Approve' : 'Reject'}</Text>
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
    meta: { flexDirection: 'row', gap: 8 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#007AFF' },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { color: '#007AFF', fontSize: 14 },
    submissionsList: { padding: 16 },
    submissionCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    submissionHeader: { flexDirection: 'row', marginBottom: 12 },
    submissionInfo: { flex: 1, marginLeft: 12 },
    submissionStudent: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    submissionDate: { fontSize: 12, color: '#999', marginBottom: 6 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    submissionActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    feedbackBox: { marginTop: 12, padding: 12, backgroundColor: '#FFF3CD', borderRadius: 8 },
    feedbackLabel: { fontSize: 12, fontWeight: '600', color: '#856404', marginBottom: 4 },
    feedbackText: { fontSize: 12, color: '#856404' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    semesterOptions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    semesterOption: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    semesterOptionActive: { backgroundColor: '#007AFF' },
    semesterOptionText: { fontSize: 16, color: '#666', fontWeight: '500' },
    semesterOptionTextActive: { color: '#fff', fontWeight: '600' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
