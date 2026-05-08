import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function AppText({ children, variant = 'body', color, style, ...props }) {
  const { colors, typography } = useTheme();

  const variants = {
    display:  { fontSize: typography['2xl'], fontWeight: typography.black, color: colors.textPrimary, letterSpacing: -0.5 },
    heading:  { fontSize: typography.xl,    fontWeight: typography.black, color: colors.textPrimary, letterSpacing: -0.3 },
    title:    { fontSize: typography.md,    fontWeight: typography.bold,  color: colors.textPrimary },
    body:     { fontSize: typography.base,  fontWeight: typography.regular, color: colors.textSecondary },
    label:    { fontSize: typography.xs,    fontWeight: typography.black, color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },
    caption:  { fontSize: typography.sm,    fontWeight: typography.medium, color: colors.textMuted },
  };

  return (
    <Text style={[variants[variant], color && { color }, style]} {...props}>
      {children}
    </Text>
  );
}
