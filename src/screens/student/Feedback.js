import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { submitFeedback, getMyFeedback } from '../../services/feedbackService';

export default function StudentFeedbackScreen() {
    const { user } = useAuth();
    const [feedback, setFeedback] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.uid) {
            loadFeedback();
        }
    }, [user]);

    const loadFeedback = async () => {
        try {
            const data = await getMyFeedback(user.uid);
            setFeedback(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Message cannot be empty');
            return;
        }

        try {
            await submitFeedback(user.uid, message);
            setMessage('');
            setModalVisible(false);
            loadFeedback();
            Alert.alert('Success', 'Feedback submitted successfully');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const renderFeedback = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'resolved' ? '#34C759' : '#FF9500' }
                ]}>
                    <Text style={styles.statusText}>
                        {item.status === 'resolved' ? 'Resolved' : 'Pending'}
                    </Text>
                </View>
                {item.createdAt && (
                    <Text style={styles.date}>
                        {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                    </Text>
                )}
            </View>

            <Text style={styles.message}>{item.message}</Text>

            {item.reply && (
                <View style={styles.replyBox}>
                    <View style={styles.replyHeader}>
                        <Ionicons name="chatbubble-ellipses" size={16} color="#007AFF" />
                        <Text style={styles.replyLabel}>Admin Reply:</Text>
                    </View>
                    <Text style={styles.replyText}>{item.reply}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Feedback & Queries</Text>
                    <Text style={styles.subtitle}>Ask questions or share feedback</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={32} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={feedback}
                renderItem={renderFeedback}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No feedback submitted yet</Text>
                        <Text style={styles.emptySubtext}>Tap + to submit your first query</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Submit Feedback</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Your Message *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Share your feedback, questions, or concerns..."
                                multiline
                                numberOfLines={8}
                            />
                            <Text style={styles.hint}>
                                Our admin team will review and respond to your message
                            </Text>
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitText}>Submit Feedback</Text>
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
    subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    date: { fontSize: 12, color: '#999' },
    message: { fontSize: 15, color: '#333', marginBottom: 12, lineHeight: 22 },
    replyBox: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    replyLabel: { fontSize: 13, fontWeight: '600', color: '#007AFF' },
    replyText: { fontSize: 14, color: '#333', lineHeight: 20 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 12 },
    emptySubtext: { fontSize: 14, color: '#ccc', marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, fontSize: 16 },
    textArea: { height: 150, textAlignVertical: 'top', marginBottom: 8 },
    hint: { fontSize: 12, color: '#999', fontStyle: 'italic' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
