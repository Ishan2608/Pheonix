import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/themeStore';
import { useTagStore } from '../store/tagStore';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import { useGoalStore } from '../store/goalStore';
import AppText from '../components/common/AppText';
import { saveItem, KEYS } from '../utils/storage';

export default function SettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { mode, toggle } = useThemeStore();
  const { tags, addTag, deleteTag } = useTagStore();
  const { taskGroups, addGroup, deleteGroup } = useTaskStore();
  const [newTag, setNewTag] = useState('');
  const [newGroup, setNewGroup] = useState('');

  const handleClearAll = () => {
    Alert.alert('Clear All Data', 'This will delete all habits, goals, tasks and logs. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Everything',
        style: 'destructive',
        onPress: async () => {
          await Promise.all(Object.values(KEYS).map((k) => saveItem(k, null)));
          Alert.alert('Done', 'All data cleared. Restart the app.');
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>

      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="x" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title">Settings</AppText>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Theme */}
        <AppText variant="label" style={styles.sectionLabel}>Appearance</AppText>
        <TouchableOpacity
          onPress={toggle}
          style={[styles.row, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg }]}
        >
          <View style={styles.rowLeft}>
            <Feather name={mode === 'dark' ? 'moon' : 'sun'} size={16} color={colors.textPrimary} />
            <AppText variant="body" color={colors.textPrimary}>Theme</AppText>
          </View>
          <AppText variant="label" color={colors.accent}>{mode === 'dark' ? 'Dark' : 'Light'}</AppText>
        </TouchableOpacity>

        {/* Tags */}
        <AppText variant="label" style={styles.sectionLabel}>Habit Tags</AppText>
        <View style={[styles.block, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg }]}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.listItem, { borderBottomColor: colors.border }]}>
              <AppText variant="body" color={colors.textPrimary}>{tag}</AppText>
              <TouchableOpacity onPress={() => deleteTag(tag)} hitSlop={8}>
                <Feather name="trash-2" size={14} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Task Groups */}
        <AppText variant="label" style={styles.sectionLabel}>Task Groups</AppText>
        <View style={[styles.block, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg }]}>
          {taskGroups.map((g) => (
            <View key={g} style={[styles.listItem, { borderBottomColor: colors.border }]}>
              <AppText variant="body" color={colors.textPrimary}>{g}</AppText>
              <TouchableOpacity onPress={() => deleteGroup(g)} hitSlop={8}>
                <Feather name="trash-2" size={14} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Danger zone */}
        <AppText variant="label" style={[styles.sectionLabel, { color: colors.danger }]}>Danger Zone</AppText>
        <TouchableOpacity
          onPress={handleClearAll}
          style={[styles.row, { backgroundColor: colors.surfaceRaised, borderColor: colors.danger, borderRadius: radius.lg }]}
        >
          <View style={styles.rowLeft}>
            <Feather name="trash-2" size={16} color={colors.danger} />
            <AppText variant="body" color={colors.danger}>Clear All Data</AppText>
          </View>
          <Feather name="chevron-right" size={16} color={colors.danger} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { marginTop: 24, marginBottom: 8 },
  row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderWidth: 1 },
  rowLeft:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  block:        { borderWidth: 1, overflow: 'hidden' },
  listItem:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
});
