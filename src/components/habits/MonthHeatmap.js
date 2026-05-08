import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getCurrentMonthDays } from '../../utils/dateUtils';
import { getHeatmapIntensity } from '../../utils/streakUtils';
import AppText from '../common/AppText';

export default function MonthHeatmap({ habit, logs }) {
  const { colors, radius } = useTheme();
  const days = getCurrentMonthDays();

  const intensityColor = (intensity) => {
    const map = [colors.heatmap0, colors.heatmap1, colors.heatmap2, colors.heatmap3, colors.heatmap4];
    return map[intensity];
  };

  return (
    <View>
      <AppText variant="label" style={{ marginBottom: 10 }}>This Month</AppText>
      <View style={styles.grid}>
        {days.map((date) => {
          const value = logs[date] || 0;
          const intensity = getHeatmapIntensity(value, habit);
          return (
            <View
              key={date}
              style={[
                styles.cell,
                {
                  backgroundColor: intensityColor(intensity),
                  borderRadius: radius.sm / 2,
                  borderColor: colors.border,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: 28, height: 28, borderWidth: 1 },
});
