import React, {useState} from 'react';
import { Text, Pressable, TextInput, ScrollView, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import axios from 'axios';
import url from "./components/config";
import { AntDesign } from '@expo/vector-icons';

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

          // Navigate based on user type
          if (response.data.type === 'user') {
            navigation.navigate("RegisteredHome");
          } else if (response.data.type === 'specialist') {
            navigation.navigate("SpecialistHomePage");
          } else if (response.data.type === 'admin') {
            navigation.navigate("AdminHomePage");
          }
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      // Handle other errors
    }
  };
  
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={[styles.container]}>
      {/* Back Button */}
      <View style={[styles.container3, {justifyContent: 'center'}]}>
        <View style = {{ flexDirection: 'row', alignItems: 'center', bottom: 120 }}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>

      {/* Title */}
        <Text style={[styles.pageTitle,  { marginLeft: 10, marginBottom: 20 }]}> Login </Text>
        <Text style= {[styles.titleNote, { marginLeft: 10, marginBottom: 40}]}> Login to continue </Text>

      {/* Form */}
        <View style={{ marginBottom: 30, alignSelf: 'center' }}>
          <Text style= {[styles.formText, {marginBottom: 10}]}> Email  {emailError ? <Text style={styles.error}>{emailError}</Text> : null} </Text>
          <TextInput style={[styles.input]} value = {email} onChangeText = {setEmail}
            keyboardType="email-address" />
        </View>

        <View style={{ marginBottom: 30, alignSelf: 'center' }}>
          <Text style= {[styles.formText, {marginBottom: 10}]}> Password {pwError ? <Text style={styles.error}>{pwError}</Text> : null} </Text>
          <TextInput style={[styles.input]} value = {password} onChangeText = {setPassword} secureTextEntry={true}/>
        </View>

        <Pressable style={[styles.formText, {marginLeft: 10, marginBottom: 20}]} onPress={() => navigation.navigate("ForgetPw")}>
          <Text  style={styles.buttonText}> Forgot Password? </Text>
        </Pressable>

        {/* Button */}
        <Pressable style={[styles.button, { marginBottom: 20, alignSelf: 'center' }]} onPress={handleLogin}>
          <Text style={styles.text}> Login </Text>
        </Pressable>

        <Pressable style={[styles.formText, { alignSelf: 'center' }]} onPress={() => navigation.navigate("AccountType")}>
          <Text>Don't have an account? <Text style={styles.buttonText}>Sign up</Text></Text>
        </Pressable>
      </View>
    </ScrollView>
    </Keyboard>
  );
};

export default Login;
