import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AntDesign, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Text, StyleSheet } from 'react-native';

import HomeScreen from '../(tabs)/home';
import CalendarScreen from '../(tabs)/calendar';
import ListScreen from '../(tabs)/list';
import PriceComparisonScreen from '../(tabs)/priceComparison';
import MealDetailsScreen from '../(tabs)/mealDetails';
import { Colors } from '../../constants/Colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CustomHeaderTitle = ({ title }) => (
  <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
    {title}
  </Text>
);

function HomeStack() {
  return (
    <Stack.Navigator
    screenOptions={{
        headerStyle: {
          backgroundColor: 'white',
          elevation: 0,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        headerTintColor: 'black',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen
        name="homepage"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="meal-details"
        component={MealDetailsScreen}
        options={({ route }) => ({ headerShown: true, headerTitle: () => (<CustomHeaderTitle title={route.params?.mealName || 'Meal Details'} />) })}
      />
    </Stack.Navigator>
  );
}

function CalendarStack() {
  return (
    <Stack.Navigator
    screenOptions={{
            headerStyle: {
              backgroundColor: 'white',
              elevation: 0,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            },
            headerTintColor: 'black',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerBackTitle: '',
          }}>
      <Stack.Screen name="calendarpage" component={CalendarScreen} options={{ headerShown: false }}/>
      <Stack.Screen
        name="meal-details"
        component={MealDetailsScreen}
        options={({ route }) => ({
          headerTitle: () => <CustomHeaderTitle title={route.params?.mealName || 'Meal Details'} />,
        })}
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
        tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 0,
            boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
            paddingTop: 10,
            height: 60,
        },
      })}
      lazy
    >
      <Tab.Screen name="home" component={HomeStack} />
      <Tab.Screen name="calendar" component={CalendarStack} />
      <Tab.Screen name="list" component={ListScreen} />
      <Tab.Screen name="priceComparison" component={PriceComparisonScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '100%',
  },
});