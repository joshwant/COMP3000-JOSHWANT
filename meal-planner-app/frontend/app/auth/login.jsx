import { View, Text, StyleSheet, Pressable, TextInput, Alert, Image } from 'react-native';
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
      <View style={styles.header}>
        <Image source={require('../assets/mainlogo.png')} style={styles.logo} />

        <Text style={styles.welcomeText}>Login to</Text>
        <Text style={styles.prepit}>PrepIt</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="gray"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="gray"
      />

      <Pressable
        style={[styles.loginButton, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </Pressable>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>
          Don't have an account?{' '}
          <Text
            style={styles.signupLink}
            onPress={() => navigation.navigate('signup')}
          >
            Sign up
          </Text>
        </Text>
      </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 20,
    color: 'gray',
  },
  prepit: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  loginText: {
    color: 'black',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
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
    color: 'gray',
  },
  loginButton: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B21E',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 4,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 14,
    color: 'gray',
  },
  signupLink: {
    fontSize: 14,
    color: '#00B21E',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
