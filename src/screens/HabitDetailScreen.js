import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import AppText from '../components/common/AppText';
import MonthHeatmap from '../components/habits/MonthHeatmap';
import { calculateStreak, calculateBestStreak, getCompletionRate } from '../utils/streakUtils';

export default function HabitDetailScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  const { habits, logs, deleteHabit } = useHabitStore();
  const habit = habits.find((h) => h.id === route.params?.habitId);
  const habitLogs = habit ? (logs[habit.id] || {}) : {};

  if (!habit) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <AppText variant="body">Habit not found.</AppText>
      </View>
    );
  }

  const streak = calculateStreak(habit, habitLogs);
  const best = calculateBestStreak(habit, habitLogs);
  const rate = getCompletionRate(habit, habitLogs);

  const stats = [
    { label: 'Current Streak', value: streak, suffix: '🔥' },
    { label: 'Best Streak',    value: best,   suffix: 'days' },
    { label: 'Completion',     value: rate,   suffix: '%' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title">{habit.title}</AppText>
        <TouchableOpacity onPress={() => navigation.navigate('CreateHabit', { habitId: habit.id })} style={styles.iconBtn}>
          <Feather name="edit-2" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Tags + type */}
        <View style={styles.row}>
          {habit.tags?.map((tag) => (
            <View key={tag} style={[styles.tagChip, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.full }]}>
              <AppText variant="label" color={colors.textMuted}>{tag}</AppText>
            </View>
          ))}
          <View style={[styles.tagChip, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.full }]}>
            <AppText variant="label" color={colors.textMuted}>{habit.type}</AppText>
          </View>
        </View>

        {habit.description ? (
          <AppText variant="body" style={{ marginTop: 8 }}>{habit.description}</AppText>
        ) : null}

        {/* Stats row */}
        <View style={[styles.statsRow, { marginTop: spacing.xl }]}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg }]}>
              <AppText variant="display" color={colors.textPrimary}>{s.value}</AppText>
              <AppText variant="label" color={colors.textMuted}>{s.suffix}</AppText>
              <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>{s.label}</AppText>
            </View>
          ))}
        </View>

        {/* Monthly heatmap */}
        <View style={[styles.section, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg, marginTop: spacing.xl }]}>
          <MonthHeatmap habit={habit} logs={habitLogs} />
        </View>

        {/* Details */}
        <View style={[styles.section, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg, marginTop: spacing.lg }]}>
          <AppText variant="label" style={{ marginBottom: 12 }}>Details</AppText>
          <DetailRow label="Started" value={habit.startDate} colors={colors} />
          <DetailRow label="Schedule" value={habit.activeDays?.join(', ') || 'Every day'} colors={colors} />
          {habit.type === 'progress' && (
            <DetailRow label="Daily Goal" value={`${habit.goal} ${habit.unit || 'units'}`} colors={colors} />
          )}
        </View>

        {/* Delete */}
        <TouchableOpacity
          onPress={() => { deleteHabit(habit.id); navigation.goBack(); }}
          style={[styles.deleteBtn, { borderColor: colors.danger, borderRadius: radius.md }]}
        >
          <Feather name="trash-2" size={14} color={colors.danger} />
          <AppText variant="label" color={colors.danger}>Delete Habit</AppText>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value, colors }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="caption" color={colors.textMuted}>{label}</AppText>
      <AppText variant="caption" color={colors.textPrimary}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1 },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  row:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tagChip:   { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statsRow:  { flexDirection: 'row', gap: 10 },
  statCard:  { flex: 1, alignItems: 'center', padding: 14, borderWidth: 1 },
  section:   { padding: 16, borderWidth: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14, borderWidth: 1 },
});
