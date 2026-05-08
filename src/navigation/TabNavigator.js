import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

// Screens
import FlowScreen from '../screens/FlowScreen';
import GoalsScreen from '../screens/GoalsScreen';
import TasksScreen from '../screens/TasksScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, label, focused, colors }) {
  return (
    <View style={[styles.tabItem, focused && { backgroundColor: colors.surfaceRaised }]}>
      <Feather
        name={name}
        size={18}
        color={focused ? colors.textPrimary : colors.textMuted}
      />
      <Text style={[styles.tabLabel, { color: focused ? colors.textPrimary : colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
        },
      }}
    >
      <Tab.Screen
        name="Flow"
        component={FlowScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="zap" label="FLOW" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="target" label="GOALS" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="check-square" label="TASKS" focused={focused} colors={colors} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
