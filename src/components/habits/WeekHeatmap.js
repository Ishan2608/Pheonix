import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getLastNDays } from '../../utils/dateUtils';
import { getHeatmapIntensity } from '../../utils/streakUtils';

export default function WeekHeatmap({ habit, logs }) {
  const { colors } = useTheme();
  const days = getLastNDays(7);

  const intensityColor = (intensity) => {
    const map = [colors.heatmap0, colors.heatmap1, colors.heatmap2, colors.heatmap3, colors.heatmap4];
    return map[intensity] || colors.heatmap0;
  };

  return (
    <View style={styles.row}>
      {days.map((date) => {
        const value = logs[date] || 0;
        const intensity = getHeatmapIntensity(value, habit);
        return (
          <View
            key={date}
            style={[
              styles.bar,
              { backgroundColor: intensityColor(intensity), borderColor: colors.border },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, alignItems: 'flex-end' },
  bar: { width: 6, height: 24, borderRadius: 3, borderWidth: 1 },
});
