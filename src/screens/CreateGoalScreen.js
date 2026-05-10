import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useGoalStore } from '../store/goalStore';
import { useHabitStore } from '../store/habitStore';
import AppText from '../components/common/AppText';
import AppButton from '../components/common/AppButton';
import DateTimeInput from '../components/common/DateTimeInput';
import { formatDate } from '../utils/dateUtils';

export default function CreateGoalScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { goals, addGoal, updateGoal } = useGoalStore();
  const { getOrderedHabits } = useHabitStore();

  const editingId = route.params?.goalId;
  const existing = editingId ? goals.find((g) => g.id === editingId) : null;
  const habits = getOrderedHabits();

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [startDate, setStartDate] = useState(existing?.startDate ? new Date(existing.startDate) : new Date());
  const [endDate, setEndDate] = useState(existing?.endDate ? new Date(existing.endDate) : null);
  const [showEndDate, setShowEndDate] = useState(!!existing?.endDate);
  const [linkedHabits, setLinkedHabits] = useState(existing?.habitIds || []);
  const [reminders, setReminders] = useState(
    existing?.reminders?.map((r) => new Date(`1970-01-01T${r}`)) || []
  );
  const addReminder = () => setReminders((prev) => [...prev, new Date()]);
  const removeReminder = (i) => setReminders((prev) => prev.filter((_, idx) => idx !== i));
  const updateReminder = (i, date) => setReminders((prev) => prev.map((r, idx) => idx === i ? date : r));

  const toggleHabit = (id) =>
    setLinkedHabits((prev) => prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]);

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    const data = {
      title: title.trim(),
      description: description.trim(),
      startDate: formatDate(startDate),
      endDate: showEndDate && endDate ? formatDate(endDate) : undefined,
      habitIds: linkedHabits,
      taskIds: existing?.taskIds || [],
      reminders: reminders.map((r) => r.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })),
    };
    existing ? updateGoal(editingId, data) : addGoal(data);
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
        <AppText variant="title">{existing ? 'Edit Goal' : 'New Goal'}</AppText>
        <TouchableOpacity onPress={handleSave} style={styles.iconBtn}>
          <Feather name="check" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <SectionLabel label="Title" />
        <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Run a Marathon" placeholderTextColor={colors.textMuted} style={[inputStyle, { height: 48, paddingHorizontal: 14 }]} />

        <SectionLabel label="Description" />
        <TextInput value={description} onChangeText={setDescription} placeholder="Optional..." placeholderTextColor={colors.textMuted} multiline style={[inputStyle, { height: 80, paddingHorizontal: 14, paddingTop: 12, textAlignVertical: 'top' }]} />

        <DateTimeInput label="Start Date" value={startDate} onChange={setStartDate} mode="date" />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 }}>
          <AppText variant="label">End Date (optional)</AppText>
          <TouchableOpacity onPress={() => setShowEndDate((v) => !v)}>
            <AppText variant="label" color={colors.accent}>{showEndDate ? 'Remove' : '+ Add'}</AppText>
          </TouchableOpacity>
        </View>
        {showEndDate && (
          <DateTimeInput value={endDate || new Date()} onChange={setEndDate} mode="date" />
        )}

        <SectionLabel label="Link Habits" />
        {habits.length === 0 ? (
          <AppText variant="caption">No habits created yet.</AppText>
        ) : (
          <View style={styles.wrap}>
            {habits.map((h) => {
              const sel = linkedHabits.includes(h.id);
              return (
                <TouchableOpacity key={h.id} onPress={() => toggleHabit(h.id)} style={[styles.chip, { backgroundColor: sel ? colors.accent : colors.surfaceRaised, borderColor: sel ? colors.accent : colors.border, borderRadius: radius.md }]}>
                  <AppText variant="label" color={sel ? '#fff' : colors.textSecondary}>{h.title}</AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Reminders */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 }}>
          <AppText variant="label">Reminders</AppText>
          <TouchableOpacity onPress={addReminder} style={[styles.chip, { borderColor: colors.accent, borderRadius: radius.full }]}>
            <AppText variant="label" color={colors.accent}>+ Add</AppText>
          </TouchableOpacity>
        </View>
        {reminders.length === 0 && <AppText variant="caption">No reminders set.</AppText>}
        {reminders.map((r, i) => (
          <View key={i} style={[styles.reminderRow, { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surfaceRaised }]}>
            <DateTimeInput value={r} onChange={(d) => updateReminder(i, d)} mode="time" />
            <TouchableOpacity onPress={() => removeReminder(i)} style={{ padding: 10 }} hitSlop={8}>
              <Feather name="x" size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <AppButton label={existing ? 'Save Changes' : 'Create Goal'} onPress={handleSave} style={{ marginTop: 32 }} />
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
  chip:    { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, marginBottom: 8, paddingRight: 4 },
});
