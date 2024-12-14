import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../(tabs)/home';
import CalendarScreen from '../(tabs)/calendar';
import ListScreen from '../(tabs)/list';
import PriceComparisonScreen from '../(tabs)/priceComparison';

const Stack = createStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator initialRouteName="home" screenOptions={{ gestureEnabled: false, headerShown: false }}>
        <Stack.Screen name="home" component={HomeScreen} />
        <Stack.Screen name="calendar" component={CalendarScreen} />
        <Stack.Screen name="list" component={ListScreen} />
        <Stack.Screen name="priceComparison" component={PriceComparisonScreen} />
      </Stack.Navigator>
  );
}