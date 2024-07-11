import React, { useState } from 'react';
import { Text, Pressable, TextInput, ScrollView, View, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import axios from 'axios';
import url from "./components/config";
import { AntDesign } from '@expo/vector-icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setError1] = useState('');
  const [pwError, setError2] = useState('');

  const navigation = useNavigation();
  const route = useRoute();

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
  
        if (response.data.error) {
          // Handle specific error messages
          if (response.data.error === 'Invalid email or password') {
            setError1('* Invalid email or password');
            setError2('* Invalid email or password');
          } else if (response.data.error === 'Suspended account' && response.data.type === 'user') {
            Alert.alert('Account Suspended', 'Please contact support for assistance.');
          } else if (response.data.error === 'Suspended account' && response.data.type === 'specialist') {
            Alert.alert('Not Verified Account', 'Account to be verified within 1 day. Please contact support for assistance.');
          } else {
            console.error('Login Error:', response.data.error);
          }
        } else {
          await AsyncStorage.setItem('user', email);
  
          // Navigate based on user type
          switch (response.data.type) {
            case 'user':
              navigation.navigate('RegisteredHome');
              break;
            case 'specialist':
              navigation.navigate('SpecialistHomePage');
              break;
            case 'admin':
              navigation.navigate('AdminHomePage');
              break;
            default:
              break;
          }
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Login Error', 'An error has occurred. Please try again.');
    }
  };

  const handleBackPress = () => {
    // Check if route.params and route.params.origin exist and navigate accordingly
    if (route.params && route.params.origin) {
      switch (route.params.origin) {
        case 'UserSettings':
        case 'SpecialistSettings':
        case 'AdminSettings':
          navigation.navigate('Welcome');
          break;
        default:
          navigation.goBack();
          break;
      }
    } else {
      navigation.goBack();
    }
  };

  const handleRegister = () => {
    if (route.params && route.params.origin) {
      switch (route.params.origin) {
        case 'RegisterSpecialist':
          navigation.navigate('RegisterSpecialist');
          break;
        default:
          navigation.navigate('Personalisation');
          break;
      }
    }
  }

  return (
    <Keyboard>
       <ScrollView contentContainerStyle={[styles.container]}>
        {/* Back Button */}
        <View style={[styles.container4, Platform.OS !== "web" && { paddingTop: 50 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom:120 }}>
            <AntDesign name="left" size={24} color="black" />
            <Pressable style={[styles.formText]} onPress={handleBackPress}>
              <Text style={styles.text}> back </Text>
            </Pressable>
          </View>

          <View style={[styles.container4, {justifyContent:'center'}]}>
            {/* Title */}
            <Text style={[styles.pageTitle, { marginBottom: 20 }]}> Login </Text>
            <Text style={[styles.titleNote, { marginBottom: 40 }]}> Login to continue </Text>

            {/* Form */}
            <View style={{ marginBottom: 30, alignSelf: 'center' }}>
              <Text style={[styles.formText, { marginBottom: 10 }]}> Email  {emailError ? <Text style={styles.error}>{emailError}</Text> : null} </Text>
              <TextInput style={[styles.input]} value={email} onChangeText={setEmail}
                keyboardType="email-address" textContentType='oneTimeCode' />
            </View>

            <View style={{ marginBottom: 30, alignSelf: 'center' }}>
              <Text style={[styles.formText, { marginBottom: 10 }]}> Password {pwError ? <Text style={styles.error}>{pwError}</Text> : null} </Text>
              <TextInput style={[styles.input]} value={password} onChangeText={setPassword} secureTextEntry={true} />
            </View>

            <Pressable style={[styles.formText, { marginLeft: 10, marginBottom: 20 }]} onPress={() => navigation.navigate("ForgetPw", { origin: 'Login' })}>
              <Text style={styles.buttonText}> Forgot Password? </Text>
            </Pressable>

            {/* Button */}
            <Pressable style={[styles.button, { marginBottom: 20, alignSelf: 'center' }]} onPress={handleLogin}>
              <Text style={styles.text}> Login </Text>
            </Pressable>

            <Pressable style={[styles.formText, { alignSelf: 'center' }]} onPress={handleRegister}>
              <Text>Don't have an account? <Text style={styles.buttonText}>Sign up</Text></Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Keyboard>
  );
};

export default Login;