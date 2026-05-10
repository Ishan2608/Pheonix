import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../common/AppText';
import WeekHeatmap from './WeekHeatmap';
import MonthHeatmap from './MonthHeatmap';
import { calculateStreak } from '../../utils/streakUtils';
import { formatDate } from '../../utils/dateUtils';

export default function HabitCard({ habit, logs, viewMode, onLog, onPress, onEdit, onDelete, selectedDate }) {
  const { colors, radius, spacing } = useTheme();
  const dateStr = selectedDate ? formatDate(selectedDate) : formatDate(new Date());
  const logValue = logs[dateStr] || 0;
  const isAction = habit.type === 'action';
  const isCompleted = isAction ? logValue >= 1 : logValue >= (habit.goal || 1);
  const streak = calculateStreak(habit, logs);
  const [progressInput, setProgressInput] = useState(String(logValue || ''));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
    >
      {/* Top row: title + tag + actions */}
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <AppText variant="title" numberOfLines={1}>{habit.title}</AppText>
          {habit.tags?.[0] && (
            <View style={[styles.tagChip, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
              <AppText variant="label" color={colors.textMuted}>{habit.tags[0]}</AppText>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} hitSlop={8}>
            <Feather name="edit-2" size={14} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={8}>
            <Feather name="trash-2" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Streak + description */}
      <View style={[styles.metaRow, { marginTop: 4 }]}>
        {habit.description
          ? <AppText variant="caption" numberOfLines={1} style={{ flex: 1 }}>{habit.description}</AppText>
          : <View style={{ flex: 1 }} />
        }
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Feather name="zap" size={10} color={colors.warning} />
            <AppText variant="label" color={colors.warning}>{streak} day streak</AppText>
          </View>
        )}
      </View>

      {/* Heatmap: week OR month depending on viewMode */}
      <View style={{ marginTop: spacing.md }}>
        {viewMode === 'heatmap'
          ? <MonthHeatmap habit={habit} logs={logs} />
          : <WeekHeatmap habit={habit} logs={logs} />
        }
      </View>

      {/* Log action */}
      <View style={[styles.logRow, { marginTop: spacing.md }]}>
        {isAction ? (
          <TouchableOpacity
            onPress={() => onLog(habit.id, isCompleted ? 0 : 1)}
            style={[
              styles.checkBtn,
              {
                borderRadius: radius.md,
                backgroundColor: isCompleted ? colors.accent : colors.surfaceRaised,
                borderColor: isCompleted ? colors.accent : colors.border,
                flex: 1,
              },
            ]}
          >
            <Feather name="check" size={16} color={isCompleted ? '#fff' : colors.textMuted} />
            <AppText variant="label" color={isCompleted ? '#fff' : colors.textMuted}>
              {isCompleted ? 'Done' : 'Mark Done'}
            </AppText>
          </TouchableOpacity>
        ) : (
          <View style={[styles.progressRow, { flex: 1 }]}>
            <AppText variant="caption">{logValue} / {habit.goal} {habit.unit}</AppText>
            <View style={styles.progressInput}>
              <TextInput
                value={progressInput}
                onChangeText={setProgressInput}
                keyboardType="numeric"
                style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700', width: 40, textAlign: 'center' }}
              />
            </View>
            <TouchableOpacity
              onPress={() => { const v = parseFloat(progressInput); if (!isNaN(v)) onLog(habit.id, v); }}
              style={[styles.logBtn, { backgroundColor: colors.accent, borderRadius: radius.sm }]}
            >
              <AppText variant="label" color="#fff">Log</AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:         { padding: 14, marginBottom: 12, borderWidth: 1 },
  topRow:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  titleBlock:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginRight: 8 },
  tagChip:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  actions:      { flexDirection: 'row', gap: 12 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakBadge:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  logRow:       { flexDirection: 'row' },
  checkBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderWidth: 1 },
  progressRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressInput:{ borderWidth: 1, borderRadius: 6, borderColor: '#333', paddingHorizontal: 4 },
  logBtn:       { paddingHorizontal: 12, paddingVertical: 8 },
});
