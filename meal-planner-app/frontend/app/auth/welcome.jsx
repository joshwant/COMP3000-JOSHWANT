import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const Welcome = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/mainlogo.png')} style={styles.logo} />

        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.prepit}>PrepIt</Text>
        <Text style={styles.subText}>
          Discover recipes, plan your meals, and shop smart with PrepIt!
        </Text>
      </View>

      <Pressable style={styles.button} onPress={() => navigation.navigate('login')}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.signupButton]} onPress={() => navigation.navigate('signup')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    color: 'black',
  },
  prepit: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00B21E',
    marginBottom: 10,
  },
  subText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: 60,
    width: '80%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B21E',
    marginBottom: 15,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButton: {
    backgroundColor: '#2C3E50',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Welcome;