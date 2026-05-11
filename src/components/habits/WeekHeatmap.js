import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getLastNDays } from '../../utils/dateUtils';
import { getHeatmapIntensity } from '../../utils/streakUtils';
import AppText from '../common/AppText';

export default function WeekHeatmap({ habit, logs }) {
  const { colors } = useTheme();
  const days = getLastNDays(7); // oldest → newest, last entry is today

  const intensityColor = (i) =>
    [colors.heatmap0, colors.heatmap1, colors.heatmap2, colors.heatmap3, colors.heatmap4][i];

  return (
    <View style={styles.row}>
      {days.map((date) => {
        const value = logs[date] || 0;
        const intensity = getHeatmapIntensity(value, habit);

        // Derive label from the actual date string
        const d = new Date(date + 'T00:00:00');
        const label = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);

        return (
          <View key={date} style={styles.cell}>
            <View style={[styles.block, { backgroundColor: intensityColor(intensity), borderColor: colors.border }]} />
            <AppText variant="caption" style={styles.dayLabel} color={colors.textMuted}>
              {label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', flex: 1 },
  cell:     { flex: 1, alignItems: 'center', gap: 4 },
  block:    { width: '85%', aspectRatio: 1, borderRadius: 4, borderWidth: 1 },
  dayLabel: { fontSize: 9 },
});
