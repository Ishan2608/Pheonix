import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useGoalStore } from '../store/goalStore';
import AppText from '../components/common/AppText';
import TagPill from '../components/common/TagPill';
import EmptyState from '../components/common/EmptyState';
import HomeHeader from '../components/common/HomeHeader';

export default function GoalsScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const { goals = [], goalCategories = [] } = useGoalStore();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filtered = selectedCategory
    ? goals.filter((g) => g.category === selectedCategory)
    : goals;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <HomeHeader>
        {/* Category filter bar */}
        <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            <TagPill label="All" selected={!selectedCategory} onPress={() => setSelectedCategory(null)} />
            {goalCategories.map((cat) => (
              <TagPill
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              />
            ))}
          </ScrollView>
        </View>
      </HomeHeader>

      <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
        <AppText variant="title">Ambitions</AppText>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGoal')} style={styles.iconBtn}>
          <Feather name="plus" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="target"
          title="No ambitions yet"
          subtitle={selectedCategory ? `No ambitions in "${selectedCategory}".` : 'Create an ambitions to start tracking.'}
          actionLabel={!selectedCategory ? 'Create Ambition' : undefined}
          onAction={() => navigation.navigate('CreateGoal')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GoalCard
              goal={item}
              colors={colors}
              radius={radius}
              spacing={spacing}
              onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })}
            />
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
      {goal.description
        ? <AppText variant="caption" numberOfLines={2} style={{ marginTop: 4 }}>{goal.description}</AppText>
        : null}
      <View style={[styles.cardFooter, { marginTop: spacing.md }]}>
        <View style={styles.footerLeft}>
          {goal.category
            ? <View style={[styles.catChip, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                <AppText variant="label" color={colors.accent}>{goal.category}</AppText>
              </View>
            : null}
          <AppText variant="label" color={colors.textMuted}>
            {goal.habitIds?.length || 0} habits · {goal.taskIds?.length || 0} tasks
          </AppText>
        </View>
        {goal.endDate ? <AppText variant="label" color={colors.textMuted}>Ends {goal.endDate}</AppText> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1 },
  filterBar:     { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, height: 48 },
  filterContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  listHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1 },
  iconBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  card:          { padding: 16, marginBottom: 12, borderWidth: 1 },
  cardTop:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catChip:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  fab:           { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
