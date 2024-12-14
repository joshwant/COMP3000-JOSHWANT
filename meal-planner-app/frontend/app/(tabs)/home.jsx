import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../auth/logout.jsx'

const Home = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Logged Out", "You have been logged out successfully.");
      console.log("Logged out successfully");
      navigation.navigate('login');
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
      console.log("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Meal Planner</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('calendar')}>
        <Text style={styles.buttonText}>Calendar</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => navigation.navigate('list')}>
        <Text style={styles.buttonText}>List</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => navigation.navigate('priceComparison')}>
        <Text style={styles.buttonText}>Price Comparison</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>

    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    padding: 20,
  },
  text: {
    color: 'black',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 6,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 4,
  },
});
