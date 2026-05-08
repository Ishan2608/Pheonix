import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { useTagStore } from '../store/tagStore';
import { useThemeStore } from '../store/themeStore';
import AppText from '../components/common/AppText';
import TagPill from '../components/common/TagPill';
import HabitCard from '../components/habits/HabitCard';
import EmptyState from '../components/common/EmptyState';
import { formatDisplayDate, getGreeting } from '../utils/dateUtils';

export default function FlowScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { getOrderedHabits, logs, logHabit, deleteHabit } = useHabitStore();
  const { tags } = useTagStore();
  const toggleTheme = useThemeStore((s) => s.toggle);

  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState('simple');

  const habits = getOrderedHabits();

  const filtered = useMemo(() => {
    if (!selectedTag) return habits;
    return habits.filter((h) => h.tags?.includes(selectedTag));
  }, [habits, selectedTag]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <View>
          <AppText variant="caption">{formatDisplayDate()}</AppText>
          <AppText variant="heading">{getGreeting()} 👋</AppText>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setViewMode(v => v === 'simple' ? 'heatmap' : 'simple')} style={styles.iconBtn}>
            <Feather name={viewMode === 'simple' ? 'grid' : 'list'} size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
            <Feather name="sun" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
            <Feather name="settings" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tag Filter Bar ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tagBar, { borderBottomColor: colors.border }]}
      >
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

      {/* ── Habit List ── */}
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
              onDelete={() => deleteHabit(item.id)}
            />
          )}
        />
      )}

      {/* ── FAB ── */}
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
  screen:      { flex: 1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerIcons: { flexDirection: 'row', gap: 4 },
  iconBtn:     { padding: 8 },
  tagBar:      { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  fab:         { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#6366f1', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
});
