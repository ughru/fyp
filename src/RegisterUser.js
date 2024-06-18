import React, { useState, useEffect } from 'react';
import { Text, Pressable, TextInput, ScrollView, View , Platform} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '../firebase';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import axios from 'axios';
import url from "./components/config";
import { AntDesign } from '@expo/vector-icons';

const RegisterUser= ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [firstNameError, setError1] = useState('');
  const [lastNameError, setError2] = useState('');
  const [emailError, setError3] = useState('');
  const [pwError, setError4] = useState('');
  const [confirmPwError, setError5] = useState('');

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [registrationInProgress, setRegistrationInProgress] = useState(false);

  useEffect(() => {
    // Retrieve selected status from AsyncStorage
    const fetchSelectedStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem('selectedStatus');
        if (storedStatus !== null) {
          setSelectedStatus(storedStatus);
        }
      } catch (error) {
        console.error('Error retrieving selected status:', error);
      }
    };

    fetchSelectedStatus();
  }, []);

  const handleRegistration = async () => {
    let valid = true;
    setRegistrationInProgress(true);

    const userData = {
      firstName: firstName,
      lastName: lastName,
      email,
      password,
      status: selectedStatus, 
    };

    try {
      // Handle Name Errors
      if (!firstName.trim()) {
        // Check if empty
        setError1('* Required field');
        valid = false;
      }
      else if ((!/^[a-zA-Z ]+$/.test(firstName))) {
        setError1('* Invalid First Name');
        valid = false;
      }
      else if (firstName.length < 2 ) {
        setError1('* Minimum 2 characters');
        valid = false;
      }
      else {
        setError1('');
      }


      // Handle Name Errors
      if (!lastName.trim()) {
        // Check if empty
        setError2('* Required field');
        valid = false;
      }
      else if ((!/^[a-zA-Z\-]+$/.test(lastName))) {
        setError2('* Invalid Last Name');
        valid = false;
      }
      else if (lastName.length < 2 ) {
        setError2('* Minimum 2 characters');
        valid = false;
      }
      else {
        setError2('');
      }

      // Handle Email Errors
      const response = await axios.post(`${url}/register`, userData);
      if (!email.trim()) {
        setError3('* Required field');
        valid = false;
      }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError3('* Invalid email format');
        valid = false;
      }
      else if (response && response.data && response.data.error === 'User already exists!') {
        setError3('* User already exists');
        valid = false;
      }
      else {
        setError3('');
      }


      // Handle Password Errors
      if (!password.trim() || !confirmPw.trim()) {
         // Check if empty
        setError4('* Required field');
        setError5('* Required field');
        valid = false;
      }
      else if (password !== confirmPw) {
        // Check if passwords match
        setError4('* Password do not match');
        setError5('* Password do not match');
        valid = false;
      }
      else if (password.length < 6 ) {
        setError4('* Password must be at least 6 characters');
        valid = false;
      }
      else if (confirmPw.length < 6 ) {
        setError5('* Password must be at least 6 characters');
        valid = false;
      }
      else {
        setError4('');
        setError5('');
      }


      if (valid) {
        const auth = getAuth();

        try {
          await createUserWithEmailAndPassword(auth, email, password);

          // Store user information in AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify({ email }));

          // Submit data to backend
          const response = await axios.post(`${url}/register`, userData);

          // Check if user already exists
          if (response.data && response.data.error === 'User already exists!') {
            // Handle case where user already exists
            setError3('* User already exists');
            return; // Stop further execution
          }

          // Navigate to the home screen if registration is successful
          navigation.navigate("RegisteredHome");
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            setError3('* Email already in use');
          } else {
            console.error('Firebase authentication error:', authError.message);
          }
        }
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError3('* Email already in use');
      } else {
        console.error('Registration error:', error.message);
      }
    } finally {
      // Reset registration in progress
      setRegistrationInProgress(false);
    }
  };


  return (
    <Keyboard>
      <ScrollView contentContainerStyle={[styles.container]}>
        {/* Back button */}
        <View style = {[{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, Platform.OS!=="web"&&{paddingTop:50}]}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>

        {/* Title */}
        <Text style={[styles.pageTitle, { marginBottom: 20 }]}> Get Started </Text>
        <Text style={[styles.titleNote, { marginBottom: 30}]}> Register as a user </Text>
  
        {/* Form */}
        <View style={[styles.container3, {alignItems: 'center'}]}>
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> First Name {firstNameError ? <Text style={styles.error}>{firstNameError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={firstName} onChangeText={setFirstName} />
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Last Name {lastNameError ? <Text style={styles.error}>{lastNameError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={lastName} onChangeText={setLastName} />
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Email {emailError ? <Text style={styles.error}>{emailError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={email} onChangeText={setEmail} keyboardType="email-address" />
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Password {pwError ? <Text style={styles.error}>{pwError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={password} onChangeText={setPassword} secureTextEntry={true} textContentType={'oneTimeCode'}/>
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Confirm Password {confirmPwError ? <Text style={styles.error}>{confirmPwError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry={true} textContentType={'oneTimeCode'}/>
          </View>
        </View>
  
        {/* Register Button */}
        <Pressable style={[styles.button4, { marginBottom: 20, alignSelf: 'center' }]} onPress={handleRegistration}>
          <Text style={styles.text}> Register </Text>
        </Pressable>
  
        {/* Register as Different User */}
        <Pressable style={[styles.formText, { marginBottom: 20, alignSelf: 'center' }]} onPress={() => navigation.navigate("AccountType")}>
          <Text style={styles.buttonText}> Register as a different user </Text>
        </Pressable>
  
        {/* Already have an account? Login */}
        <Pressable style={[styles.formText, { marginBottom: 20, alignSelf: 'center' }]} onPress={() => navigation.navigate("Login")}>
          <Text>Already have an account? <Text style={styles.buttonText}>Login</Text></Text>
        </Pressable>
      </ScrollView>
    </Keyboard>
  );
};


export default RegisterUser;