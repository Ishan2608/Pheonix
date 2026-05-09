import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useTaskStore } from '../store/taskStore';
import AppText from '../components/common/AppText';
import TagPill from '../components/common/TagPill';
import EmptyState from '../components/common/EmptyState';

export default function TasksScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { tasks, taskGroups, toggleTask, deleteTask } = useTaskStore();
  const [selectedGroup, setSelectedGroup] = useState(null);

  const filtered = selectedGroup
    ? tasks.filter((t) => t.groupId === selectedGroup)
    : tasks;

  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.date && b.date) return a.date.localeCompare(b.date);
    return 0;
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>

      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <AppText variant="heading">Tasks</AppText>
        <TouchableOpacity onPress={() => navigation.navigate('CreateTask')} style={styles.iconBtn}>
          <Feather name="plus" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Group filter */}
      <View style={[styles.groupBar, { borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={[null, ...taskGroups]}
          keyExtractor={(g, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TagPill
              label={item || 'All'}
              selected={selectedGroup === item}
              onPress={() => setSelectedGroup(item)}
            />
          )}
        />
      </View>

      {sorted.length === 0 ? (
        <EmptyState
          icon="check-square"
          title="No tasks"
          subtitle={selectedGroup ? `No tasks in "${selectedGroup}"` : 'Add something to get started.'}
          actionLabel={!selectedGroup ? 'Add Task' : undefined}
          onAction={() => navigation.navigate('CreateTask')}
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              colors={colors}
              radius={radius}
              spacing={spacing}
              onToggle={() => toggleTask(item.id)}
              onDelete={() => deleteTask(item.id)}
              onEdit={() => navigation.navigate('CreateTask', { taskId: item.id })}
            />
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateTask')}
        style={[styles.fab, { backgroundColor: colors.accent, borderRadius: radius.full }]}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function TaskItem({ task, colors, radius, onToggle, onDelete, onEdit }) {
  return (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <TouchableOpacity onPress={onToggle} style={styles.checkbox} activeOpacity={0.7}>
        <View style={[
          styles.check,
          {
            borderColor: task.completed ? colors.accent : colors.border,
            backgroundColor: task.completed ? colors.accent : 'transparent',
            borderRadius: 4,
          },
        ]}>
          {task.completed && <Feather name="check" size={12} color="#fff" />}
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
        <View style={styles.itemMeta}>
          {task.date ? <AppText variant="caption">{task.date}{task.time ? ` · ${task.time}` : ''}</AppText> : null}
          {task.groupId ? <AppText variant="caption" color={colors.accent}>{task.groupId}</AppText> : null}
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity onPress={onEdit} hitSlop={8}>
          <Feather name="edit-2" size={14} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} hitSlop={8}>
          <Feather name="trash-2" size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  iconBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  groupBar:    { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  item:        { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, borderWidth: 1 },
  checkbox:    { marginRight: 12 },
  check:       { width: 20, height: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1 },
  itemMeta:    { flexDirection: 'row', gap: 8, marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 12, marginLeft: 12 },
  fab:         { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
