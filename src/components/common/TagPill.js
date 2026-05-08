import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';
import { useTheme } from '../hooks/useTheme';

export default function TagPill({ label, selected, onPress }) {
  const { colors, radius } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? colors.accent : colors.surfaceRaised,
          borderRadius: radius.full,
          borderColor: selected ? colors.accent : colors.border,
        },
      ]}
    >
      <AppText
        variant="label"
        color={selected ? '#fff' : colors.textSecondary}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
  },
});
