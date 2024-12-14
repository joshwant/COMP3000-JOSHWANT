import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from '@/config/firebase';

const auth = getAuth(app);

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('home');
      console.log('Logged in successfully');
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.code === 'auth/invalid-email') {
      message = 'Invalid email format. Please try again.';
    } else if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email. Please sign up.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many login attempts. Please try again later.';
    }
    Alert.alert('Login Error', message);
    console.error('Login Error:', error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => navigation.navigate('signup')}>
        <Text style={styles.buttonText}>Don't have an account? Sign Up</Text>
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
    padding: 20,
  },
  text: {
    color: 'black',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
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
