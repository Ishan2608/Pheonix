import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { useTagStore } from '../store/tagStore';
import AppText from '../components/common/AppText';
import TagPill from '../components/common/TagPill';
import HabitCard from '../components/habits/HabitCard';
import EmptyState from '../components/common/EmptyState';
import HomeHeader from '../components/common/HomeHeader';

export default function FlowScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const { getOrderedHabits, logs, logHabit, deleteHabit } = useHabitStore();
  const { tags = [] } = useTagStore();
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState('simple');

  const habits = getOrderedHabits();
  const filtered = useMemo(() => {
    if (!selectedTag) return habits;
    return habits.filter((h) => h.tags?.includes(selectedTag));
  }, [habits, selectedTag]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>

      <HomeHeader>
        <View style={[styles.tagBar, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagBarContent}>
            <TagPill label="All" selected={!selectedTag} onPress={() => setSelectedTag(null)} />
            {tags.map((tag) => (
              <TagPill
                key={tag}
                label={tag}
                selected={selectedTag === tag}
                onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
              />
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={() => setViewMode(v => v === 'simple' ? 'heatmap' : 'simple')}
            style={[styles.viewToggle, { borderLeftColor: colors.border }]}
          >
            <Feather name={viewMode === 'simple' ? 'grid' : 'list'} size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </HomeHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon="zap"
          title="No habits yet"
          subtitle={selectedTag ? `No habits tagged "${selectedTag}"` : 'Start building your flow.'}
          actionLabel={!selectedTag ? 'Create Habit' : undefined}
          onAction={() => navigation.navigate('CreateHabit')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(h) => h.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              logs={logs[item.id] || {}}
              viewMode={viewMode}
              onLog={logHabit}
              onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
              onEdit={() => navigation.navigate('CreateHabit', { habitId: item.id })}
              onDelete={() =>
                Alert.alert('Delete Habit', `Delete "${item.title}"? This will also remove all its logs.`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(item.id) },
                ])
              }
            />
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateHabit')}
        style={[styles.fab, { backgroundColor: colors.accent, borderRadius: radius.full }]}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1 },
  tagBar:       { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, height: 48 },
  tagBarContent:{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  viewToggle:   { paddingHorizontal: 14, height: '100%', alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1 },
  fab:          { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#6366f1', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
});
