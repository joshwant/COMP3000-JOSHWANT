import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AntDesign, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

import HomeScreen from '../(tabs)/home';
import CalendarScreen from '../(tabs)/calendar';
import ListScreen from '../(tabs)/list';
import PriceComparisonScreen from '../(tabs)/priceComparison';
import MealDetailsScreen from '../(tabs)/mealDetails';
import { Colors } from '../../constants/Colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="meal-details"
        component={MealDetailsScreen}
        options={{ headerShown: true, title: 'Meal Details' }}
      />
    </Stack.Navigator>
  );
}

export default function UserStack() {
  return (
    <Tab.Navigator
      initialRouteName="home"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'home') {
            iconName = 'home';
            return <FontAwesome5 name={iconName} size={size} color={color} />;
          } else if (route.name === 'calendar') {
            iconName = 'calendar';
            return <AntDesign name={iconName as any} size={size} color={color} />;
          } else if (route.name === 'list') {
            iconName = 'list-ul';
            return <FontAwesome6 name={iconName} size={size} color={color} />;
          } else if (route.name === 'priceComparison') {
            iconName = 'pound-sign';
            return <FontAwesome5 name={iconName} size={size} color={color} />;
          }
        },
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="home" component={HomeStack} />
      <Tab.Screen name="calendar" component={CalendarScreen} />
      <Tab.Screen name="list" component={ListScreen} />
      <Tab.Screen name="priceComparison" component={PriceComparisonScreen} />
    </Tab.Navigator>
  );
}