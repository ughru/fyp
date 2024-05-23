import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { Text, Pressable, TextInput, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getAuth } from '../firebase';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import axios from 'axios';
import url from "./components/config";


const RegisterUser= ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [noUser, setNoUser] = useState("No User");


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
  const [currentUserEmail, setCurrentUserEmail] = useState('');

    const userData = {
      firstName: firstName,
      lastName: lastName,
      type: "user",
      email,
      password,
      status: selectedStatus, 
    };
  const userData = {
    firstName: firstName,
    lastName: lastName,
    type: "user",
    email,
    password,
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      }
    });
    return unsubscribe;
  }, []);

  const handleRegistration = async () => {
    let valid = true;


    try {
      // Handle Name Errors
      if (!firstName) {
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
      if (!lastName) {
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
      if (!email) {
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
      if (!password || !confirmPw) {
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={[styles.pageTitle, {top: 80, left: 20}]}> Get Started </Text>
      <Text style= {[styles.titleNote, {top: 120, left: 20}]}> Register as a user </Text>


      <Text style= {[styles.formText, {top: 170, left: 30}]}> First Name {firstNameError ? <Text style={styles.error}>{firstNameError}</Text> : null} </Text>
      <TextInput style={[styles.input, {top: 200, left: 30}]} value = {firstName} onChangeText = {setFirstName} />


      <Text style= {[styles.formText, {top: 270, left: 30}]} > Last Name {lastNameError ? <Text style={styles.error}>{lastNameError}</Text> : null} </Text>
      <TextInput style={[styles.input, {top: 300, left: 30}]} value = {lastName} onChangeText = {setLastName}/>


      <Text style= {[styles.formText, {top: 370, left: 30}]}> Email {emailError ? <Text style={styles.error}>{emailError}</Text> : null} </Text>
      <TextInput style={[styles.input, {top: 400, left: 30}]} value = {email} onChangeText = {setEmail}
        keyboardType="email-address"/>


      <Text style= {[styles.formText, {top: 470, left: 30}]}> Password {pwError ? <Text style={styles.error}>{pwError}</Text> : null} </Text>
      <TextInput style={[styles.input, {top: 500, left: 30}]} value = {password} onChangeText = {setPassword} secureTextEntry={true}/>


      <Text style= {[styles.formText, {top: 570, left: 30}]}> Confirm Password {confirmPwError ? <Text style={styles.error}>{confirmPwError}</Text> : null} </Text>
      <TextInput style={[styles.input, {top: 600, left: 30}]} value = {confirmPw} onChangeText = {setConfirmPw} secureTextEntry={true}/>


      {/* Button */}
      <Pressable style={[styles.button4, {top: 670}]} onPress={handleRegistration}>
        <Text style={styles.text}> Register </Text>
      </Pressable>


      <Pressable style={[styles.formText, { top: 730 }]} onPress={() => navigation.navigate("AccountType")}>
        <Text style={styles.buttonText}> Register as different user </Text>
      </Pressable>
     
      <Pressable style={[styles.formText, { top: 760 }]} onPress={() => navigation.navigate("Login")}>
        <Text>Already have an account? <Text style={styles.buttonText}>Login</Text></Text>
      </Pressable>

    </ScrollView>
    </Keyboard>
  );
};


export default RegisterUser;
 