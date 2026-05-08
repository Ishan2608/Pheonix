import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import CreateHabitScreen from '../screens/CreateHabitScreen';
import GoalDetailScreen from '../screens/GoalDetailScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
        <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
        <Stack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
