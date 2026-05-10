import React, { useState, useRef } from 'react';
import {
  View, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useTaskStore } from '../store/taskStore';
import AppText from '../components/common/AppText';
import EmptyState from '../components/common/EmptyState';
import HomeHeader from '../components/common/HomeHeader';
import DateFilterBar from '../components/common/DateFilterBar';
import { formatDate } from '../utils/dateUtils';

export default function TasksScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const { tasks = [], taskGroups = [], toggleTask, deleteTask, addGroup, renameGroup, deleteGroup } = useTaskStore();

  const [activeGroup, setActiveGroup] = useState(taskGroups[0] || null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [renamingGroup, setRenamingGroup] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const selectedDateStr = formatDate(selectedDate);

  const groupTasks = tasks
    .filter((t) => t.groupId === activeGroup && (!t.date || t.date === selectedDateStr))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.date && b.date) return a.date.localeCompare(b.date);
      return 0;
    });

  const pendingCount = groupTasks.filter((t) => !t.completed).length;
  const doneCount = groupTasks.filter((t) => t.completed).length;

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    addGroup(name);
    setActiveGroup(name);
    setNewGroupName('');
    setShowGroupModal(false);
  };

  const handleRename = () => {
    const name = renameValue.trim();
    if (!name || !renamingGroup) return;
    if (activeGroup === renamingGroup) setActiveGroup(name);
    renameGroup(renamingGroup, name);
    setRenamingGroup(null);
    setRenameValue('');
  };

  const handleDeleteGroup = (group) => {
    Alert.alert(
      `Delete "${group}"?`,
      'All tasks in this group will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGroup(group);
            setActiveGroup(taskGroups.find((g) => g !== group) || null);
            setShowManageModal(false);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>

      <HomeHeader>
        <View style={[styles.dateBar, { borderBottomColor: colors.border }]}>
          <DateFilterBar selectedDate={selectedDate} onSelect={setSelectedDate} />
        </View>
      </HomeHeader>
      <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
        <AppText variant="title">{activeGroup || 'Tasks'}</AppText>
        <TouchableOpacity onPress={() => setShowManageModal(true)} style={styles.iconBtn}>
          <Feather name="more-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Group Tabs ── */}
      <View style={[styles.groupTabBar, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupTabContent}>
          {taskGroups.map((group) => {
            const active = activeGroup === group;
            return (
              <TouchableOpacity
                key={group}
                onPress={() => setActiveGroup(group)}
                style={[
                  styles.groupTab,
                  active && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
                ]}
              >
                <AppText
                  variant="label"
                  color={active ? colors.accent : colors.textMuted}
                >
                  {group}
                </AppText>
                <View style={[styles.countBadge, { backgroundColor: active ? colors.accent : colors.surfaceRaised }]}>
                  <AppText variant="caption" style={{ fontSize: 9 }} color={active ? '#fff' : colors.textMuted}>
                    {tasks.filter((t) => t.groupId === group && !t.completed).length}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* New list button */}
          <TouchableOpacity
            onPress={() => setShowGroupModal(true)}
            style={[styles.groupTab, styles.newGroupTab]}
          >
            <Feather name="plus" size={14} color={colors.textMuted} />
            <AppText variant="label" color={colors.textMuted}>New List</AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Task List ── */}
      {taskGroups.length === 0 ? (
        <EmptyState
          icon="list"
          title="No lists yet"
          subtitle="Create a list to start adding tasks."
          actionLabel="Create List"
          onAction={() => setShowGroupModal(true)}
        />
      ) : groupTasks.length === 0 ? (
        <EmptyState
          icon="check-square"
          title="No tasks"
          subtitle={`Add tasks to "${activeGroup}".`}
          actionLabel="Add Task"
          onAction={() => navigation.navigate('CreateTask', { defaultGroup: activeGroup })}
        />
      ) : (
        <FlatList
          data={groupTasks}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingVertical: spacing.lg, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            doneCount > 0 ? (
              <View style={[styles.completedHeader, { borderTopColor: colors.border }]}>
                <AppText variant="label" color={colors.textMuted}>{doneCount} Completed</AppText>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              colors={colors}
              radius={radius}
              spacing={spacing}
              onToggle={() => toggleTask(item.id)}
              onDelete={() =>
                Alert.alert('Delete Task', `Delete "${item.title}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteTask(item.id) },
                ])
              }
              onPress={() => navigation.navigate('CreateTask', { taskId: item.id })}
            />
          )}
        />
      )}

      {/* ── FAB ── */}
      {activeGroup && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateTask', { defaultGroup: activeGroup })}
          style={[styles.fab, { backgroundColor: colors.accent, borderRadius: radius.full }]}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ── New List Modal ── */}
      <Modal visible={showGroupModal} transparent animationType="fade" onRequestClose={() => setShowGroupModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalBox, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.xl }]}>
            <AppText variant="title" style={{ marginBottom: 16 }}>New List</AppText>
            <TextInput
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="List name..."
              placeholderTextColor={colors.textMuted}
              autoFocus
              style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.bg }]}
              onSubmitEditing={handleCreateGroup}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => { setShowGroupModal(false); setNewGroupName(''); }} style={[styles.modalBtn, { backgroundColor: colors.bg, borderRadius: radius.md }]}>
                <AppText variant="label" color={colors.textSecondary}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateGroup} style={[styles.modalBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}>
                <AppText variant="label" color="#fff">Create</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Manage Lists Modal ── */}
      <Modal visible={showManageModal} transparent animationType="slide" onRequestClose={() => setShowManageModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowManageModal(false)}>
          <View style={[styles.manageSheet, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <AppText variant="title" style={{ marginBottom: 16, paddingHorizontal: 20 }}>Manage Lists</AppText>

            {taskGroups.map((group) => (
              <View key={group}>
                {renamingGroup === group ? (
                  <View style={[styles.renameRow, { borderBottomColor: colors.border }]}>
                    <TextInput
                      value={renameValue}
                      onChangeText={setRenameValue}
                      autoFocus
                      style={[styles.renameInput, { color: colors.textPrimary, borderColor: colors.accent, borderRadius: radius.md, backgroundColor: colors.bg }]}
                      onSubmitEditing={handleRename}
                    />
                    <TouchableOpacity onPress={handleRename} style={styles.iconBtn}>
                      <Feather name="check" size={18} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRenamingGroup(null)} style={styles.iconBtn}>
                      <Feather name="x" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.manageRow, { borderBottomColor: colors.border }]}>
                    <Feather name="list" size={16} color={colors.textMuted} style={{ marginRight: 12 }} />
                    <AppText variant="body" color={colors.textPrimary} style={{ flex: 1 }}>{group}</AppText>
                    <TouchableOpacity onPress={() => { setRenamingGroup(group); setRenameValue(group); }} style={styles.iconBtn} hitSlop={8}>
                      <Feather name="edit-2" size={15} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteGroup(group)} style={styles.iconBtn} hitSlop={8}>
                      <Feather name="trash-2" size={15} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={() => { setShowManageModal(false); setShowGroupModal(true); }}
              style={[styles.manageRow, { borderBottomColor: 'transparent' }]}
            >
              <Feather name="plus" size={16} color={colors.accent} style={{ marginRight: 12 }} />
              <AppText variant="body" color={colors.accent}>New List</AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

function TaskItem({ task, colors, radius, onToggle, onDelete, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.item, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={styles.checkWrap} hitSlop={8}>
        <View style={[
          styles.check,
          {
            borderColor: task.completed ? colors.accent : colors.border,
            backgroundColor: task.completed ? colors.accent : 'transparent',
            borderRadius: radius.full,
          },
        ]}>
          {task.completed && <Feather name="check" size={11} color="#fff" />}
        </View>
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <AppText
          variant="body"
          color={task.completed ? colors.textMuted : colors.textPrimary}
          style={task.completed ? { textDecorationLine: 'line-through' } : null}
          numberOfLines={1}
        >
          {task.title}
        </AppText>
        {(task.description || task.date) ? (
          <View style={styles.itemMeta}>
            {task.date ? (
              <AppText variant="caption">{task.date}{task.time ? ` · ${task.time}` : ''}</AppText>
            ) : null}
            {task.description ? (
              <AppText variant="caption" numberOfLines={2} style={{ flexShrink: 1 }}>{task.description}</AppText>
            ) : null}
          </View>
        ) : null}
      </View>

      <TouchableOpacity onPress={onDelete} hitSlop={8} style={{ padding: 8 }}>
        <Feather name="trash-2" size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1 },
  dateBar:         { borderBottomWidth: 1 },
  listHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1 },
  iconBtn:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  groupTabBar:     { borderBottomWidth: 1 },
  groupTabContent: { paddingHorizontal: 12 },
  groupTab:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 12, marginRight: 4 },
  newGroupTab:     { opacity: 0.6 },
  countBadge:      { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },

  item:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  checkWrap:       { marginRight: 14 },
  check:           { width: 22, height: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  itemContent:     { flex: 1, overflow: 'hidden' },
  itemMeta:        { flexDirection: 'row', gap: 8, marginTop: 3 },

  completedHeader: { paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, marginTop: 8 },

  fab:             { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', elevation: 4 },

  // Modals
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox:        { width: '85%', padding: 24, borderWidth: 1 },
  modalInput:      { height: 48, paddingHorizontal: 14, borderWidth: 1, marginBottom: 16, fontSize: 15 },
  modalActions:    { flexDirection: 'row', gap: 10 },
  modalBtn:        { flex: 1, paddingVertical: 12, alignItems: 'center' },

  manageSheet:     { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, paddingBottom: 40, paddingTop: 12 },
  sheetHandle:     { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  manageRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  renameRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1 },
  renameInput:     { flex: 1, height: 40, paddingHorizontal: 12, borderWidth: 1.5, fontSize: 14, marginRight: 4 },
});
