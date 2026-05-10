import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useGoalStore } from '../store/goalStore';
import { useHabitStore } from '../store/habitStore';
import AppText from '../components/common/AppText';
import EmptyState from '../components/common/EmptyState';
import HomeHeader from '../components/common/HomeHeader';

export default function GoalsScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const { goals } = useGoalStore();
  const { logs } = useHabitStore();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>

      <HomeHeader />
      <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
        <AppText variant="title">Goals</AppText>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGoal')} style={styles.iconBtn}>
          <Feather name="plus" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <EmptyState
          icon="target"
          title="No goals yet"
          subtitle="Link habits and tasks to a goal to track progress."
          actionLabel="Create Goal"
          onAction={() => navigation.navigate('CreateGoal')}
        />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GoalCard goal={item} colors={colors} radius={radius} spacing={spacing} onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })} />
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateGoal')}
        style={[styles.fab, { backgroundColor: colors.accent, borderRadius: radius.full }]}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function GoalCard({ goal, colors, radius, spacing, onPress }) {
  const linkedCount = (goal.habitIds?.length || 0) + (goal.taskIds?.length || 0);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
    >
      <View style={styles.cardTop}>
        <AppText variant="title" numberOfLines={1} style={{ flex: 1 }}>{goal.title}</AppText>
        <Feather name="chevron-right" size={16} color={colors.textMuted} />
      </View>
      {goal.description ? <AppText variant="caption" numberOfLines={2} style={{ marginTop: 4 }}>{goal.description}</AppText> : null}
      <View style={[styles.cardFooter, { marginTop: spacing.md }]}>
        <AppText variant="label" color={colors.textMuted}>{goal.habitIds?.length || 0} habits · {goal.taskIds?.length || 0} tasks</AppText>
        {goal.endDate ? <AppText variant="label" color={colors.textMuted}>Ends {goal.endDate}</AppText> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen:     { flex: 1 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  iconBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  card:       { padding: 16, marginBottom: 12, borderWidth: 1 },
  cardTop:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  fab:        { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
