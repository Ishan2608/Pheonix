import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../common/AppText';
import { getLastNDays } from '../../utils/dateUtils';

const CHART_HEIGHT = 120;
const BAR_RADIUS = 3;

export default function ProgressChart({ habit, logs }) {
  const { colors } = useTheme();
  const days = getLastNDays(14);
  const goal = habit.goal || 1;

  const values = days.map((date) => logs[date] || 0);
  const maxVal = Math.max(...values, goal) * 1.2;

  const toY = (val) => CHART_HEIGHT - (val / maxVal) * CHART_HEIGHT;
  const goalY = toY(goal);

  return (
    <View style={styles.container}>
      <AppText variant="label" style={{ marginBottom: 10 }}>
        Daily Progress — last 14 days
      </AppText>

      <View style={[styles.chartWrap, { borderColor: colors.border }]}>
        <Svg width="100%" height={CHART_HEIGHT + 24} viewBox={`0 0 280 ${CHART_HEIGHT + 24}`}>
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.3" />
            </LinearGradient>
          </Defs>

          {/* Goal line */}
          <Line
            x1={0}
            y1={goalY}
            x2={280}
            y2={goalY}
            stroke={colors.accentGlow}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.6}
          />

          {/* Goal label */}
          <SvgText
            x={274}
            y={goalY - 3}
            fill={colors.accentGlow}
            fontSize={8}
            textAnchor="end"
            opacity={0.8}
          >
            {goal} {habit.unit || ''}
          </SvgText>

          {/* Bars */}
          {values.map((val, i) => {
            const barWidth = 280 / 14;
            const x = i * barWidth + barWidth * 0.2;
            const w = barWidth * 0.6;
            const barH = Math.max((val / maxVal) * CHART_HEIGHT, val > 0 ? 3 : 0);
            const y = CHART_HEIGHT - barH;
            const overGoal = val >= goal;

            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={barH}
                rx={BAR_RADIUS}
                fill={overGoal ? colors.accent : colors.heatmap2}
                opacity={val === 0 ? 0.15 : 1}
              />
            );
          })}

          {/* X axis day labels — every 7 days */}
          {days.map((date, i) => {
            if (i !== 0 && i !== 6 && i !== 13) return null;
            const barWidth = 280 / 14;
            const x = i * barWidth + barWidth / 2;
            const label = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <SvgText
                key={date}
                x={x}
                y={CHART_HEIGHT + 16}
                fill={colors.textMuted}
                fontSize={8}
                textAnchor="middle"
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  chartWrap: { borderRadius: 8, overflow: 'hidden' },
});
