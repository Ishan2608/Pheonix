import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import AppText from './AppText';
import { formatDisplayDate, getGreeting } from '../../utils/dateUtils';

export default function HomeHeader({ children }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { mode, toggle } = useThemeStore();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption">{formatDisplayDate()}</AppText>
          <AppText variant="heading">{getGreeting()}</AppText>
        </View>
        <View style={styles.icons}>
          <TouchableOpacity onPress={toggle} style={styles.iconBtn}>
            <Feather name={mode === 'dark' ? 'sun' : 'moon'} size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
            <Feather name="settings" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header:  { borderBottomWidth: 1 },
  top:     { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  icons:   { flexDirection: 'row', gap: 2 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
