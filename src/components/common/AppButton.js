import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';
import { useTheme } from '../hooks/useTheme';

export default function AppButton({ label, onPress, variant = 'primary', style }) {
  const { colors, radius } = useTheme();

  const variants = {
    primary: { bg: colors.accent,       text: '#fff' },
    ghost:   { bg: colors.surfaceRaised, text: colors.textPrimary },
    danger:  { bg: 'transparent',        text: colors.danger, borderColor: colors.danger, borderWidth: 1 },
  };

  const v = variants[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderRadius: radius.md },
        v.borderColor && { borderWidth: v.borderWidth, borderColor: v.borderColor },
        style,
      ]}
    >
      <AppText variant="label" color={v.text}>{label}</AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
