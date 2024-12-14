import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('welcome')}>
        <Text style={styles.buttonText}>Back to Welcome</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => navigation.navigate('signup')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'white',
    },
    text: {
      color: 'white',
      fontSize: 42,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      marginBottom: 120,
      marginTop: 40,
    },
    link: {
      color: 'white',
      fontSize: 42,
      fontWeight: 'bold',
      textAlign: 'center',
      textDecorationLine: 'underline',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 4,
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
    }
  })