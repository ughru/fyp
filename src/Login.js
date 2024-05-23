import React, {useState} from 'react';
import { Text, Pressable, TextInput, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import styles from './components/styles';
import axios from 'axios';
import url from "./components/config";

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setError1] = useState('');
  const [pwError, setError2] = useState('');

  navigation.addListener('focus', () => {
    setEmail('');
    setPassword('');
  });

  const handleLogin = async () => {
    let valid = true; 

    try {
      // Handle Errors
      if (!email) {
        setError1('* Required field');
        valid = false;
      }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError1('* Invalid email format');
        valid = false;
      }
      else {
          setError1('');
      }

      if (!password) {
        // Check if empty
        setError2('* Required field');
        valid = false;
      }
      else {
        setError2('');
      }

      if (valid) {
        /*
        const response = await axios.post(`${url}/login`, { email, password });

        // Check response for errors
        if (response.data && response.data.error) {
          if (response.data.error === 'User does not exist!') {
            setError1('* User does not exist');
          } else if (response.data.error === 'Invalid password') {
            setError2('* Incorrect password');
          } else {
            // Handle other errors
            console.error('Login error:', response.data.error);
          }
        } else {
          await AsyncStorage.setItem('user', email);

          // Navigate to the home screen upon successful login
          navigation.navigate("RegisteredHome");
        }
        */

        const auth = getAuth();
        try {
          await signInWithEmailAndPassword(auth, email, password);
          // Navigate to the home screen upon successful login
          navigation.navigate("RegisteredHome");
        } catch (authError) {
          if (authError.code === 'auth/user-not-found') {
            setError1('* User does not exist');
          } else if (authError.code === 'auth/wrong-password') {
            setError2('* Incorrect password');
          } else {
            console.error('Firebase login error:', authError.message);
          }
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      // Handle other errors
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={[styles.pageTitle, {top: 200, left: 30}]}> Login </Text>
      <Text style= {[styles.titleNote, {top: 240, left: 30,}]}> Login to continue </Text>

      <Text style= {[styles.formText, {top: 300, left: 30}]}> Email  {emailError ? <Text style={styles.error}>{emailError}</Text> : null} </Text>
      <TextInput style={[styles.input, {top: 330, left: 30}]} value = {email} onChangeText = {setEmail}
        keyboardType="email-address" />

      <Text style= {[styles.formText, {top: 400, left: 30}]}> Password {pwError ? <Text style={styles.error}>{pwError}</Text> : null} </Text>
      <TextInput style={[styles.input, {top: 430, left: 30}]} value = {password} onChangeText = {setPassword} secureTextEntry={true}/>

      <Pressable style={[styles.formText, { top: 480, left: 30}]}>
        <Text  style={styles.buttonText}> Forgot Password? </Text>
      </Pressable>

      {/* Button */}
      <Pressable style={[styles.button, {top: 530}]} onPress={handleLogin}>
        <Text style={styles.text}> Login </Text>
      </Pressable>

      <Pressable style={[styles.formText, { top: 580 }]} onPress={() => navigation.navigate("AccountType")}>
        <Text>Don't have an account? <Text style={styles.buttonText}>Sign up</Text></Text>
      </Pressable>
    </ScrollView>
  );
};

export default Login;
