import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/themeStore';
import { useTagStore } from '../store/tagStore';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import AppText from '../components/common/AppText';
import { saveItem, KEYS } from '../utils/storage';

// ─── Reusable editable list section ─────────────────────────────────────────

function EditableList({ items, onAdd, onRename, onDelete, deleteMessage, colors, radius }) {
  const [newValue, setNewValue] = useState('');
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const handleAdd = () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewValue('');
  };

  const handleRename = (item) => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === item) { setRenamingItem(null); return; }
    onRename(item, trimmed);
    setRenamingItem(null);
    setRenameValue('');
  };

  return (
    <View>
      <View style={[styles.block, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg }]}>
        {items.map((item, idx) => (
          <View key={item} style={[styles.listItem, { borderBottomColor: colors.border, borderBottomWidth: idx < items.length - 1 ? 1 : 0 }]}>
            {renamingItem === item ? (
              <View style={styles.renameRow}>
                <TextInput
                  value={renameValue}
                  onChangeText={setRenameValue}
                  autoFocus
                  style={[styles.renameInput, { color: colors.textPrimary, borderColor: colors.accent, backgroundColor: colors.bg, borderRadius: radius.sm }]}
                  onSubmitEditing={() => handleRename(item)}
                />
                <TouchableOpacity onPress={() => handleRename(item)} hitSlop={8} style={styles.actionBtn}>
                  <Feather name="check" size={16} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRenamingItem(null)} hitSlop={8} style={styles.actionBtn}>
                  <Feather name="x" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <AppText variant="body" color={colors.textPrimary} style={{ flex: 1 }}>{item}</AppText>
                <TouchableOpacity
                  onPress={() => { setRenamingItem(item); setRenameValue(item); }}
                  hitSlop={8}
                  style={styles.actionBtn}
                >
                  <Feather name="edit-2" size={14} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(`Delete "${item}"?`, deleteMessage, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item) },
                    ])
                  }
                  hitSlop={8}
                  style={styles.actionBtn}
                >
                  <Feather name="trash-2" size={14} color={colors.danger} />
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </View>

      {/* Add new */}
      <View style={[styles.addRow, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg }]}>
        <TextInput
          value={newValue}
          onChangeText={setNewValue}
          placeholder="Add new..."
          placeholderTextColor={colors.textMuted}
          style={[styles.addInput, { color: colors.textPrimary }]}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={handleAdd}
          style={[styles.addBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
        >
          <Feather name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { mode, toggle } = useThemeStore();
  const { tags, addTag, renameTag, deleteTag } = useTagStore();
  const { taskGroups, addGroup, renameGroup, deleteGroup } = useTaskStore();
  const { goalCategories = [], addGoalCategory, renameGoalCategory, deleteGoalCategory } = useGoalStore();

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all habits, goals, tasks and logs. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await Promise.all(Object.values(KEYS).map((k) => saveItem(k, null)));
            Alert.alert('Done', 'All data cleared. Restart the app.');
          },
        },
      ]
    );
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

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* Habit Tags */}
        <AppText variant="label" style={styles.sectionLabel}>Habit Tags</AppText>
        <EditableList
          items={tags}
          onAdd={addTag}
          onRename={renameTag}
          onDelete={deleteTag}
          deleteMessage="Habits with this tag will keep their data but lose this tag."
          colors={colors}
          radius={radius}
        />

        {/* Goal Categories */}
        <AppText variant="label" style={styles.sectionLabel}>Goal Categories</AppText>
        <EditableList
          items={goalCategories}
          onAdd={addGoalCategory}
          onRename={renameGoalCategory}
          onDelete={deleteGoalCategory}
          deleteMessage="Goals in this category will keep their data but lose this category."
          colors={colors}
          radius={radius}
        />

        {/* Task Lists */}
        <AppText variant="label" style={styles.sectionLabel}>Task Lists</AppText>
        <EditableList
          items={taskGroups}
          onAdd={addGroup}
          onRename={renameGroup}
          onDelete={deleteGroup}
          deleteMessage="All tasks inside this list will be permanently deleted."
          colors={colors}
          radius={radius}
        />

        {/* Danger Zone */}
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
  block:        { borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  listItem:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  renameRow:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  renameInput:  { flex: 1, height: 36, paddingHorizontal: 10, borderWidth: 1.5, fontSize: 14 },
  actionBtn:    { paddingHorizontal: 6 },
  addRow:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, gap: 8 },
  addInput:     { flex: 1, height: 36, fontSize: 14 },
  addBtn:       { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
