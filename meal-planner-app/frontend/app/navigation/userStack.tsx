import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../(tabs)/home';

const Stack = createStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator initialRouteName="home" screenOptions={{ gestureEnabled: false, headerShown: false }}>
        <Stack.Screen name="home" component={HomeScreen} />
      </Stack.Navigator>
  );
}