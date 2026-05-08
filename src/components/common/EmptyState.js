import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from './AppText';
import AppButton from './AppButton';
import { useTheme } from '../../hooks/useTheme';

export default function EmptyState({ icon = 'inbox', title, subtitle, actionLabel, onAction }) {
  const { colors, radius } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised, borderRadius: radius.xl, borderColor: colors.border }]}>
        <Feather name={icon} size={28} color={colors.textMuted} />
      </View>
      <AppText variant="heading" style={styles.title}>{title}</AppText>
      {subtitle && <AppText variant="caption" style={styles.subtitle}>{subtitle}</AppText>}
      {actionLabel && onAction && (
        <AppButton label={actionLabel} onPress={onAction} style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  iconWrap:  { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 4 },
  title:     { textAlign: 'center' },
  subtitle:  { textAlign: 'center', maxWidth: 200 },
  btn:       { marginTop: 8 },
});
