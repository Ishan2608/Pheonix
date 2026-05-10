import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, Polyline } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../common/AppText';
import { getLastNDays } from '../../utils/dateUtils';

const W = 300;
const H = 130;
const PAD = { top: 16, right: 16, bottom: 28, left: 28 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

export default function ProgressChart({ habit, logs }) {
  const { colors } = useTheme();
  const days = getLastNDays(14);
  const target = habit.goal || 1;
  const values = days.map((d) => logs[d] || 0);
  const maxVal = Math.max(...values, target) * 1.25 || 1;

  const toX = (i) => PAD.left + (i / (days.length - 1)) * INNER_W;
  const toY = (v) => PAD.top + INNER_H - (v / maxVal) * INNER_H;

  // Build polyline points string
  const points = values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  // Build filled area path
  const areaPath = [
    `M ${toX(0)},${toY(0)}`,
    ...values.map((v, i) => `L ${toX(i)},${toY(v)}`),
    `L ${toX(days.length - 1)},${PAD.top + INNER_H}`,
    `L ${toX(0)},${PAD.top + INNER_H}`,
    'Z',
  ].join(' ');

  const goalY = toY(target);

  // Y axis labels
  const yLabels = [0, Math.round(target / 2), target, Math.round(maxVal * 0.8)];

  return (
    <View style={styles.container}>
      <AppText variant="label" style={{ marginBottom: 8 }}>
        Progress — last 14 days {habit.unit ? `(${habit.unit})` : ''}
      </AppText>

      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Y axis grid lines */}
        {yLabels.map((v) => {
          const y = toY(v);
          return (
            <React.Fragment key={v}>
              <Line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke={colors.border} strokeWidth={1} />
              <SvgText x={PAD.left - 4} y={y + 3} fill={colors.textMuted} fontSize={8} textAnchor="end">{v}</SvgText>
            </React.Fragment>
          );
        })}

        {/* Goal line */}
        <Line
          x1={PAD.left} y1={goalY}
          x2={W - PAD.right} y2={goalY}
          stroke={colors.accentGlow}
          strokeWidth={1.5}
          strokeDasharray="5,3"
        />
        <SvgText x={W - PAD.right + 2} y={goalY + 3} fill={colors.accentGlow} fontSize={8}>Target</SvgText>

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <Polyline
          points={points}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {values.map((v, i) => (
          <Circle
            key={i}
            cx={toX(i)}
            cy={toY(v)}
            r={v > 0 ? 3.5 : 2}
            fill={v >= target ? colors.accent : v > 0 ? colors.heatmap2 : colors.border}
            stroke={colors.bg}
            strokeWidth={1.5}
          />
        ))}

        {/* X axis labels — first, middle, last */}
        {[0, 6, 13].map((i) => {
          const label = new Date(days[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <SvgText key={i} x={toX(i)} y={H - 4} fill={colors.textMuted} fontSize={8} textAnchor="middle">
              {label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <AppText variant="caption">Goal met</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.heatmap2 }]} />
          <AppText variant="caption">Below target</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDash, { backgroundColor: colors.accentGlow }]} />
          <AppText variant="caption">Target ({target} {habit.unit || ''})</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { paddingVertical: 4 },
  legend:     { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendDash: { width: 12, height: 2, borderRadius: 1 },
});
