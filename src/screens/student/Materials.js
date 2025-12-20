import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMaterials, recordMaterialView } from '../../services/materialService'; // Updated import
import { fetchSubjects } from '../../services/universityService';
import { useAuth } from '../../context/AuthContext';

export default function StudentMaterialsScreen({ route }) {
    const { user } = useAuth();
    const subjectId = route?.params?.subjectId || 'all';
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMaterials();
    }, [subjectId]);

    const loadMaterials = async () => {
        try {
            const data = await getMaterials(subjectId);
            setMaterials(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMaterial = (url, materialId) => {
        // Track the view
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

    const renderMaterial = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleOpenMaterial(item.fileUrl, item.id)}
        >
            <View style={[styles.iconBox, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                <Ionicons name={getTypeIcon(item.type)} size={32} color={getTypeColor(item.type)} />
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.meta}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                        <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                    </View>
                    {item.uploadedAt && (
                        <Text style={styles.date}>
                            {new Date(item.uploadedAt.seconds * 1000).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Study Materials</Text>
            </View>

            <FlatList
                data={materials}
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
    title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    typeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    date: { fontSize: 12, color: '#999' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 12 },
    emptySubtext: { fontSize: 14, color: '#ccc', marginTop: 4 },
});
