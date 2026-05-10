import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useGoalStore } from '../store/goalStore';
import { useHabitStore } from '../store/habitStore';
import { useTaskStore } from '../store/taskStore';
import AppText from '../components/common/AppText';

export default function GoalDetailScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  const { goals, deleteGoal, toggleHabitInGoal, toggleTaskInGoal } = useGoalStore();
  const { habits } = useHabitStore();
  const { tasks } = useTaskStore();

  const goal = goals.find((g) => g.id === route.params?.goalId);

  if (!goal) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <AppText variant="body">Goal not found.</AppText>
      </View>
    );
  }

  const linkedHabits = habits.filter((h) => goal.habitIds?.includes(h.id));
  const linkedTasks  = tasks.filter((t) => goal.taskIds?.includes(t.id));

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title">{goal.title}</AppText>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGoal', { goalId: goal.id })} style={styles.iconBtn}>
          <Feather name="edit-2" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {goal.description ? <AppText variant="body" style={{ marginBottom: spacing.lg }}>{goal.description}</AppText> : null}

        {/* Dates */}
        <View style={[styles.section, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.lg }]}>
          <Row label="Started" value={goal.startDate} colors={colors} />
          {goal.endDate ? <Row label="Ends" value={goal.endDate} colors={colors} /> : null}
        </View>

        {/* Linked Habits */}
        <AppText variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Linked Habits</AppText>
        {linkedHabits.length === 0 ? (
          <AppText variant="caption">None linked.</AppText>
        ) : (
          linkedHabits.map((h) => (
            <View key={h.id} style={[styles.item, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.md }]}>
              <AppText variant="body" color={colors.textPrimary}>{h.title}</AppText>
              <TouchableOpacity onPress={() => toggleHabitInGoal(goal.id, h.id)} hitSlop={8}>
                <Feather name="x" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Linked Tasks */}
        <AppText variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Linked Tasks</AppText>
        {linkedTasks.length === 0 ? (
          <AppText variant="caption">None linked.</AppText>
        ) : (
          linkedTasks.map((t) => (
            <View key={t.id} style={[styles.item, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.md }]}>
              <AppText variant="body" color={t.completed ? colors.textMuted : colors.textPrimary} style={t.completed ? { textDecorationLine: 'line-through' } : null}>{t.title}</AppText>
              <TouchableOpacity onPress={() => toggleTaskInGoal(goal.id, t.id)} hitSlop={8}>
                <Feather name="x" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Delete */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete Goal', `Delete "${goal.title}"? Linked habits and tasks will not be deleted, only unlinked.`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => { deleteGoal(goal.id); navigation.goBack(); } },
            ])
          }
          style={[styles.deleteBtn, { borderColor: colors.danger, borderRadius: radius.md }]}
        >
          <Feather name="trash-2" size={14} color={colors.danger} />
          <AppText variant="label" color={colors.danger}>Delete Goal</AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, colors }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color={colors.textMuted}>{label}</AppText>
      <AppText variant="caption" color={colors.textPrimary}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1 },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  section:   { padding: 16, borderWidth: 1 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  item:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, marginBottom: 8 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, paddingVertical: 14, borderWidth: 1 },
});
