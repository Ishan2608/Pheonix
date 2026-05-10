import React, { useState } from 'react';
import {
  View, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { useTagStore } from '../store/tagStore';
import AppText from '../components/common/AppText';
import AppButton from '../components/common/AppButton';
import DateTimeInput from '../components/common/DateTimeInput';
import { formatDate } from '../utils/dateUtils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function CreateHabitScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { habits, addHabit, updateHabit } = useHabitStore();
  const { tags, addTag } = useTagStore();

  const editingId = route.params?.habitId;
  const existing = editingId ? habits.find((h) => h.id === editingId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [selectedTags, setSelectedTags] = useState(existing?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [activeDays, setActiveDays] = useState(existing?.activeDays || DAY_KEYS);
  const [startDate, setStartDate] = useState(existing?.startDate ? new Date(existing.startDate) : new Date());
  const [type, setType] = useState(existing?.type || 'action');
  const [goal, setGoal] = useState(String(existing?.goal || ''));
  const [unit, setUnit] = useState(existing?.unit || '');
  const [reminders, setReminders] = useState(
    existing?.reminders?.map((r) => new Date(`1970-01-01T${r}`)) || []
  );

  const addReminder = () => setReminders((prev) => [...prev, new Date()]);
  const removeReminder = (i) => setReminders((prev) => prev.filter((_, idx) => idx !== i));
  const updateReminder = (i, date) => setReminders((prev) => prev.map((r, idx) => idx === i ? date : r));

  const toggleDay = (day) =>
    setActiveDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);

  const toggleTag = (tag) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    addTag(trimmed);
    setSelectedTags((prev) => [...prev, trimmed]);
    setNewTagInput('');
  };

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    const data = {
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
      startDate: existing?.startDate || formatDate(startDate),
      activeDays,
      type,
      goal: type === 'progress' ? parseFloat(goal) || 1 : undefined,
      unit: type === 'progress' ? unit.trim() : undefined,
      reminders: reminders.map((r) =>
        r.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      ),
    };
    if (existing) {
      updateHabit(editingId, data);
    } else {
      addHabit(data);
    }
    navigation.goBack();
  };

  const SectionLabel = ({ label }) => (
    <AppText variant="label" style={{ marginBottom: 8, marginTop: 20 }}>{label}</AppText>
  );

  const inputStyle = [styles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.md }];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="x" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title">{existing ? 'Edit Habit' : 'New Habit'}</AppText>
        <TouchableOpacity onPress={handleSave} style={styles.iconBtn}>
          <Feather name="check" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Title */}
        <SectionLabel label="Title" />
        <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Morning Run" placeholderTextColor={colors.textMuted} style={[inputStyle, { height: 48, paddingHorizontal: 14 }]} />

        {/* Description */}
        <SectionLabel label="Description" />
        <TextInput value={description} onChangeText={setDescription} placeholder="Optional note..." placeholderTextColor={colors.textMuted} multiline style={[inputStyle, { height: 80, paddingHorizontal: 14, paddingTop: 12, textAlignVertical: 'top' }]} />

        {/* Tags */}
        <SectionLabel label="Tags" />
        <View style={styles.wrap}>
          {tags.map((tag) => {
            const sel = selectedTags.includes(tag);
            return (
              <TouchableOpacity key={tag} onPress={() => toggleTag(tag)} style={[styles.chip, { backgroundColor: sel ? colors.accent : colors.surfaceRaised, borderColor: sel ? colors.accent : colors.border, borderRadius: radius.full }]}>
                <AppText variant="label" color={sel ? '#fff' : colors.textSecondary}>{tag}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.newTagRow}>
          <TextInput value={newTagInput} onChangeText={setNewTagInput} placeholder="New tag..." placeholderTextColor={colors.textMuted} style={[styles.newTagInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceRaised, borderRadius: radius.md }]} />
          <TouchableOpacity onPress={handleAddNewTag} style={[styles.addTagBtn, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.md }]}>
            <Feather name="plus" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Start Date */}
        <DateTimeInput label="Starting Date" value={startDate} onChange={setStartDate} mode="date" />

        {/* Active Days */}
        <SectionLabel label="Active Days" />
        <View style={styles.daysRow}>
          {DAYS.map((day, i) => {
            const key = DAY_KEYS[i];
            const active = activeDays.includes(key);
            return (
              <TouchableOpacity key={key} onPress={() => toggleDay(key)} style={[styles.dayBtn, { backgroundColor: active ? colors.accent : colors.surfaceRaised, borderColor: active ? colors.accent : colors.border, borderRadius: radius.sm }]}>
                <AppText variant="label" color={active ? '#fff' : colors.textMuted}>{day}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Type */}
        <SectionLabel label="Type" />
        <View style={styles.segmentRow}>
          {['action', 'progress'].map((t) => {
            const active = type === t;
            return (
              <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.segment, { backgroundColor: active ? colors.accent : colors.surfaceRaised, borderColor: active ? colors.accent : colors.border, borderRadius: radius.md }]}>
                <AppText variant="label" color={active ? '#fff' : colors.textSecondary}>{t === 'action' ? 'Action' : 'Progress'}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Progress fields */}
        {type === 'progress' && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <SectionLabel label="Daily Goal" />
              <TextInput value={goal} onChangeText={setGoal} keyboardType="numeric" placeholder="8" placeholderTextColor={colors.textMuted} style={[inputStyle, { height: 48, paddingHorizontal: 14 }]} />
            </View>
            <View style={{ flex: 1 }}>
              <SectionLabel label="Unit" />
              <TextInput value={unit} onChangeText={setUnit} placeholder="glasses" placeholderTextColor={colors.textMuted} style={[inputStyle, { height: 48, paddingHorizontal: 14 }]} />
            </View>
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

        <AppButton label={existing ? 'Save Changes' : 'Create Habit'} onPress={handleSave} style={{ marginTop: 32 }} />
        {existing && <AppButton label="Cancel" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  input:       { borderWidth: 1 },
  wrap:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  newTagRow:   { flexDirection: 'row', gap: 8, marginTop: 10 },
  newTagInput: { flex: 1, height: 40, paddingHorizontal: 12, borderWidth: 1, fontSize: 13 },
  addTagBtn:   { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, marginBottom: 8, paddingRight: 4 },
  dayBtn:      { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1 },
  daysRow:     { flexDirection: 'row', gap: 4 },
  segmentRow:  { flexDirection: 'row', gap: 10 },
  segment:     { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
});
