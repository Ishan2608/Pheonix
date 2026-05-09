import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import AppText from '../components/common/AppText';
import AppButton from '../components/common/AppButton';
import DateTimeInput from '../components/common/DateTimeInput';
import { formatDate } from '../utils/dateUtils';
import { generateId } from '../utils/storage';

export default function CreateTaskScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { tasks, taskGroups, addTask, updateTask } = useTaskStore();
  const { goals, toggleTaskInGoal } = useGoalStore();

  const editingId = route.params?.taskId;
  const existing = editingId ? tasks.find((t) => t.id === editingId) : null;

  const [title, setTitle]           = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [date, setDate]             = useState(existing?.date ? new Date(existing.date) : new Date());
  const [time, setTime]             = useState(existing?.time ? new Date(`1970-01-01T${existing.time}`) : new Date());
  const [showTime, setShowTime]     = useState(!!existing?.time);
  const [groupId, setGroupId] = useState(existing?.groupId || route.params?.defaultGroup || null);
  const [linkedGoals, setLinkedGoals] = useState(
    goals.filter((g) => g.taskIds?.includes(editingId)).map((g) => g.id)
  );

  const toggleGoal = (id) =>
    setLinkedGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    const data = {
      title: title.trim(),
      description: description.trim(),
      date: formatDate(date),
      time: showTime ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
      groupId,
    };

    let savedId = editingId;
    if (existing) {
      updateTask(editingId, data);
    } else {
      savedId = generateId();
      addTask({ ...data, id: savedId });
    }

    // Sync goal links
    goals.forEach((g) => {
      const wasLinked = g.taskIds?.includes(savedId);
      const shouldLink = linkedGoals.includes(g.id);
      if (wasLinked !== shouldLink) toggleTaskInGoal(g.id, savedId);
    });

    navigation.goBack();
  };

  const inputStyle = [styles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.md }];
  const SectionLabel = ({ label }) => <AppText variant="label" style={{ marginBottom: 8, marginTop: 20 }}>{label}</AppText>;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="x" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title">{existing ? 'Edit Task' : 'New Task'}</AppText>
        <TouchableOpacity onPress={handleSave} style={styles.iconBtn}>
          <Feather name="check" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <SectionLabel label="Title" />
        <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Buy groceries" placeholderTextColor={colors.textMuted} style={[inputStyle, { height: 48, paddingHorizontal: 14 }]} />

        <SectionLabel label="Description" />
        <TextInput value={description} onChangeText={setDescription} placeholder="Optional..." placeholderTextColor={colors.textMuted} multiline style={[inputStyle, { height: 80, paddingHorizontal: 14, paddingTop: 12, textAlignVertical: 'top' }]} />

        <DateTimeInput label="Date" value={date} onChange={setDate} mode="date" />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 }}>
          <AppText variant="label">Time (optional)</AppText>
          <TouchableOpacity onPress={() => setShowTime((v) => !v)}>
            <AppText variant="label" color={colors.accent}>{showTime ? 'Remove' : '+ Add'}</AppText>
          </TouchableOpacity>
        </View>
        {showTime && <DateTimeInput value={time} onChange={setTime} mode="time" />}

        <SectionLabel label="Group" />
        <View style={styles.wrap}>
          {taskGroups.map((g) => {
            const sel = groupId === g;
            return (
              <TouchableOpacity key={g} onPress={() => setGroupId(sel ? null : g)} style={[styles.chip, { backgroundColor: sel ? colors.accent : colors.surfaceRaised, borderColor: sel ? colors.accent : colors.border, borderRadius: radius.full }]}>
                <AppText variant="label" color={sel ? '#fff' : colors.textSecondary}>{g}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionLabel label="Link to Goal" />
        {goals.length === 0 ? (
          <AppText variant="caption">No goals created yet.</AppText>
        ) : (
          <View style={styles.wrap}>
            {goals.map((g) => {
              const sel = linkedGoals.includes(g.id);
              return (
                <TouchableOpacity key={g.id} onPress={() => toggleGoal(g.id)} style={[styles.chip, { backgroundColor: sel ? colors.accent : colors.surfaceRaised, borderColor: sel ? colors.accent : colors.border, borderRadius: radius.md }]}>
                  <AppText variant="label" color={sel ? '#fff' : colors.textSecondary}>{g.title}</AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <AppButton label={existing ? 'Save Changes' : 'Create Task'} onPress={handleSave} style={{ marginTop: 32 }} />
        {existing && <AppButton label="Cancel" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  input:   { borderWidth: 1 },
  wrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:    { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
});
