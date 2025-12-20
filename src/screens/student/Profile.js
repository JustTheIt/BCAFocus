import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/authService';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        university: user?.university || 'TU'
    });

    const handleUpdate = async () => {
        try {
            await updateUserProfile(user.uid, formData);
            setModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout
                }
            ]
        );
    };

    const InfoRow = ({ icon, label, value, color = '#007AFF' }) => (
        <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'Not set'}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={48} color="#007AFF" />
                    </View>
                    <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0] || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? '#FF3B30' : '#007AFF' }]}>
                        <Text style={styles.roleText}>{user?.role || 'student'}</Text>
                    </View>
                </View>

                {/* Profile Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile Information</Text>

                    <InfoRow
                        icon="person-outline"
                        label="Full Name"
                        value={user?.displayName || user?.name}
                        color="#007AFF"
                    />

                    <InfoRow
                        icon="mail-outline"
                        label="Email"
                        value={user?.email}
                        color="#5856D6"
                    />

                    <InfoRow
                        icon="school-outline"
                        label="University"
                        value={user?.university}
                        color="#FF9500"
                    />

                    <InfoRow
                        icon="shield-checkmark-outline"
                        label="Account Status"
                        value={user?.active !== false ? 'Active' : 'Inactive'}
                        color="#34C759"
                    />
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="create-outline" size={20} color="#007AFF" />
                        <Text style={styles.actionButtonText}>Edit Profile</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                        <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Enter your name"
                            />

                            <Text style={styles.label}>University</Text>
                            <View style={styles.universityOptions}>
                                {['TU', 'PU', 'Purbanchal'].map((uni) => (
                                    <TouchableOpacity
                                        key={uni}
                                        style={[
                                            styles.uniOption,
                                            formData.university === uni && styles.uniOptionActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, university: uni })}
                                    >
                                        <Text style={[
                                            styles.uniOptionText,
                                            formData.university === uni && styles.uniOptionTextActive
                                        ]}>
                                            {uni}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity onPress={handleUpdate} style={styles.submitButton}>
                            <Text style={styles.submitText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    content: { padding: 20 },
    header: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
    email: { fontSize: 14, color: '#666', marginBottom: 12 },
    roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
    roleText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#000' },
    infoRow: {
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
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
    infoValue: { fontSize: 16, color: '#000', fontWeight: '500' },
    actionButton: {
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
    actionButtonText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#007AFF', marginLeft: 12 },
    logoutButton: { borderWidth: 1, borderColor: '#FFE5E5' },
    logoutText: { color: '#FF3B30' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    universityOptions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    uniOption: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F2F2F7', alignItems: 'center', borderWidth: 2, borderColor: '#F2F2F7' },
    uniOptionActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    uniOptionText: { fontSize: 14, fontWeight: '500', color: '#666' },
    uniOptionTextActive: { color: '#fff' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
