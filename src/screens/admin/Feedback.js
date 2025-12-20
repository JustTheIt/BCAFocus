import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllFeedback, replyToFeedback } from '../../services/feedbackService';

export default function AdminFeedbackScreen() {
    const [feedback, setFeedback] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        try {
            const data = await getAllFeedback();
            setFeedback(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) {
            Alert.alert('Error', 'Reply cannot be empty');
            return;
        }

        try {
            await replyToFeedback(selectedFeedback.id, replyText);
            setModalVisible(false);
            setReplyText('');
            setSelectedFeedback(null);
            loadFeedback();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const openReplyModal = (item) => {
        setSelectedFeedback(item);
        setReplyText(item.reply || '');
        setModalVisible(true);
    };

    const renderFeedback = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.userIcon}>
                    <Ionicons name="person" size={20} color="#007AFF" />
                </View>
                <View style={styles.statusBadge}>
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: item.status === 'resolved' ? '#34C759' : '#FF9500' }
                    ]} />
                    <Text style={styles.statusText}>{item.status || 'pending'}</Text>
                </View>
            </View>

            <Text style={styles.message}>{item.message}</Text>

            {item.reply && (
                <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>Admin Reply:</Text>
                    <Text style={styles.replyText}>{item.reply}</Text>
                </View>
            )}

            {item.createdAt && (
                <Text style={styles.date}>
                    {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                </Text>
            )}

            <TouchableOpacity onPress={() => openReplyModal(item)} style={styles.replyBtn}>
                <Ionicons name="chatbubble-outline" size={18} color="#007AFF" />
                <Text style={styles.replyBtnText}>
                    {item.reply ? 'Edit Reply' : 'Reply'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Student Feedback</Text>
                <Text style={styles.count}>{feedback.length} total</Text>
            </View>

            <FlatList
                data={feedback}
                renderItem={renderFeedback}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No feedback yet</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Reply to Feedback</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Student Message:</Text>
                            <View style={styles.originalMessage}>
                                <Text style={styles.originalMessageText}>
                                    {selectedFeedback?.message}
                                </Text>
                            </View>

                            <Text style={styles.label}>Your Reply:</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={replyText}
                                onChangeText={setReplyText}
                                placeholder="Type your reply..."
                                multiline
                                numberOfLines={5}
                            />
                        </ScrollView>

                        <TouchableOpacity onPress={handleReply} style={styles.submitButton}>
                            <Text style={styles.submitText}>Send Reply</Text>
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
    count: { fontSize: 14, color: '#666' },
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
    userIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
    message: { fontSize: 15, color: '#333', marginBottom: 12, lineHeight: 22 },
    replyBox: {
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    replyLabel: { fontSize: 12, fontWeight: '600', color: '#007AFF', marginBottom: 4 },
    replyText: { fontSize: 14, color: '#333', lineHeight: 20 },
    date: { fontSize: 12, color: '#999', marginBottom: 12 },
    replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
    replyBtnText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    modalBody: { padding: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
    originalMessage: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, marginBottom: 16 },
    originalMessageText: { fontSize: 14, color: '#666', lineHeight: 20 },
    input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, fontSize: 16 },
    textArea: { height: 120, textAlignVertical: 'top' },
    submitButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
