import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './AppText';
import { useTheme } from '../hooks/useTheme';

export default function ScreenHeader({ title, onBack, rightIcon, onRightPress }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.7}>
        <Feather name="arrow-left" size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      <AppText variant="title">{title}</AppText>

      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name={rightIcon} size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
