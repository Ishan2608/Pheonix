import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from './AppText';
import { formatDate, getDateRange, shortDayLabel } from '../../utils/dateUtils';

export default function DateFilterBar({ selectedDate, onSelect }) {
  const { colors, radius } = useTheme();
  const scrollRef = useRef(null);
  const dates = getDateRange(7, 14);
  const todayStr = formatDate(new Date());
  const selectedStr = formatDate(selectedDate);

  // Scroll to today on mount
  useEffect(() => {
    const todayIndex = dates.findIndex((d) => formatDate(d) === todayStr);
    if (scrollRef.current && todayIndex > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: todayIndex * 60, animated: false });
      }, 100);
    }
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {dates.map((date) => {
        const dateStr = formatDate(date);
        const isSelected = dateStr === selectedStr;
        const isToday = dateStr === todayStr;
        const dayNum = date.getDate();
        const dayName = shortDayLabel(date);

        return (
          <TouchableOpacity
            key={dateStr}
            onPress={() => onSelect(date)}
            activeOpacity={0.7}
            style={[
              styles.card,
              {
                backgroundColor: isSelected ? colors.accent : colors.surfaceRaised,
                borderColor: isToday && !isSelected ? colors.accent : colors.border,
                borderRadius: radius.md,
              },
            ]}
          >
            <AppText
              variant="label"
              color={isSelected ? '#fff' : isToday ? colors.accent : colors.textMuted}
              style={styles.dayName}
            >
              {dayName}
            </AppText>
            <AppText
              variant="title"
              color={isSelected ? '#fff' : colors.textPrimary}
              style={styles.dayNum}
            >
              {dayNum}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  card:    { width: 52, alignItems: 'center', paddingVertical: 8, borderWidth: 1 },
  dayName: { fontSize: 9, marginBottom: 4 },
  dayNum:  { fontSize: 16 },
});
