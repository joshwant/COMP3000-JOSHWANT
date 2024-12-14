import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../auth/welcome';
import LoginScreen from '../auth/login';
import SignupScreen from '../auth/signup';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="welcome" screenOptions={{ gestureEnabled: false, headerShown: false }}>
      <Stack.Screen name="welcome" component={WelcomeScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

