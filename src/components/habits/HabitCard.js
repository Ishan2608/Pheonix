import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../common/AppText';
import WeekHeatmap from './WeekHeatmap';
import { calculateStreak } from '../../utils/streakUtils';
import { formatDate } from '../../utils/dateUtils';

export default function HabitCard({ habit, logs, viewMode, onLog, onPress, onEdit, onDelete }) {
  const { colors, radius, spacing } = useTheme();
  const today = formatDate(new Date());
  const logValue = logs[today] || 0;
  const isAction = habit.type === 'action';
  const isCompleted = isAction ? logValue >= 1 : logValue >= (habit.goal || 1);
  const streak = calculateStreak(habit, logs);
  const [progressInput, setProgressInput] = useState(String(logValue));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
    >
      {/* Top row */}
      <View style={styles.row}>
        <View style={styles.titleRow}>
          <AppText variant="title" numberOfLines={1} style={{ flex: 1 }}>{habit.title}</AppText>
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

      {/* Description + streak */}
      <View style={styles.row}>
        {habit.description ? (
          <AppText variant="caption" numberOfLines={1} style={{ flex: 1 }}>{habit.description}</AppText>
        ) : <View style={{ flex: 1 }} />}
        {streak > 0 && (
          <View style={styles.streakRow}>
            <Feather name="zap" size={10} color={colors.warning} />
            <AppText variant="label" color={colors.warning}>{streak} day streak</AppText>
          </View>
        )}
      </View>

      {/* Bottom: heatmap + action */}
      <View style={[styles.row, { marginTop: spacing.md }]}>
        <WeekHeatmap habit={habit} logs={logs} />

        {isAction ? (
          <TouchableOpacity
            onPress={() => onLog(habit.id, isCompleted ? 0 : 1)}
            style={[
              styles.checkBtn,
              {
                borderRadius: radius.md,
                backgroundColor: isCompleted ? colors.accent : colors.surfaceRaised,
                borderColor: isCompleted ? colors.accent : colors.border,
              },
            ]}
          >
            <Feather name="check" size={20} color={isCompleted ? '#fff' : colors.textMuted} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.progressRow}>
            <AppText variant="caption">{logValue}/{habit.goal} {habit.unit}</AppText>
            <TextInput
              value={progressInput}
              onChangeText={setProgressInput}
              keyboardType="numeric"
              style={[styles.progressInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}
            />
            <TouchableOpacity
              onPress={() => { const v = parseFloat(progressInput); if (!isNaN(v)) onLog(habit.id, v); }}
              style={[styles.logBtn, { backgroundColor: colors.accent, borderRadius: radius.sm }]}
            >
              <AppText variant="label" color="#fff">Log</AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Heatmap view mode: show 5-week grid */}
      {viewMode === 'heatmap' && (
        <View style={[styles.heatmapGrid, { marginTop: spacing.md, borderTopColor: colors.border }]}>
          {Array.from({ length: 35 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (34 - i));
            const date = formatDate(d);
            const value = logs[date] || 0;
            const filled = isAction ? value >= 1 : value >= (habit.goal || 1);
            return (
              <View
                key={date}
                style={[
                  styles.heatCell,
                  { backgroundColor: filled ? colors.accent : colors.heatmap0, borderColor: colors.border },
                ]}
              />
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:        { padding: 16, marginBottom: 12, borderWidth: 1 },
  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  tagChip:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  actions:     { flexDirection: 'row', gap: 12 },
  streakRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  checkBtn:    { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressInput: { width: 44, height: 32, borderWidth: 1, borderRadius: 6, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  logBtn:      { paddingHorizontal: 10, paddingVertical: 6 },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, paddingTop: 12, borderTopWidth: 1 },
  heatCell:    { width: 14, height: 14, borderRadius: 2, borderWidth: 1 },
});
