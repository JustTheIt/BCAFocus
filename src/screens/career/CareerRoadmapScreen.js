import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCareerResources } from '../../services/careerService';
import colors from '../../constants/colors';

const CareerRoadmapScreen = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            const data = await getCareerResources();
            setResources(data);
        } catch (error) {
            console.error('Failed to load career resources:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadResources();
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

    const getTypeColor = (type) => {
        switch (type) {
            case 'roadmap': return '#007AFF';
            case 'guide': return '#34C759';
            case 'job': return '#FF9500';
            case 'video': return '#FF2D55';
            default: return '#8E8E93';
        }
    };

    const renderResource = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => item.url && Linking.openURL(item.url)}
            disabled={!item.url}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) + '15' }]}>
                    <Ionicons name={getTypeIcon(item.type)} size={28} color={getTypeColor(item.type)} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.title}>{item.title}</Text>
                    <View style={styles.meta}>
                        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                            <Text style={styles.typeText}>{item.type?.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.category}>{item.category}</Text>
                    </View>
                </View>
                {item.url && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
            </View>
            <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
            {item.url && (
                <View style={styles.cardFooter}>
                    <Ionicons name="link-outline" size={16} color={colors.primary} />
                    <Text style={styles.linkText}>View Resource</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <FlatList
                data={resources}
                renderItem={renderResource}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Career Guidance</Text>
                        <Text style={styles.headerSubTitle}>Explore roadmaps, guides, and opportunities to shape your future.</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="briefcase-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No career resources available yet.</Text>
                        <Text style={styles.emptySubtext}>Check back later for roadmaps and job guides.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 20 },
    header: { padding: 20, backgroundColor: '#fff', marginBottom: 12 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
    headerSubTitle: { fontSize: 15, color: '#666', marginTop: 8, lineHeight: 22 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardInfo: { flex: 1 },
    title: { fontSize: 18, fontWeight: '700', color: '#000' },
    meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    typeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    category: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
    description: { fontSize: 14, color: '#444', lineHeight: 20 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7', gap: 6 },
    linkText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 16, textAlign: 'center' },
    emptySubtext: { fontSize: 14, color: '#BBB', marginTop: 8, textAlign: 'center' },
});

export default CareerRoadmapScreen;
