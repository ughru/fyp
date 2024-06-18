import React, { useEffect, useState } from 'react';
import { Text, Pressable, TextInput, ScrollView, View, Platform } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from '../firebase';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import { AntDesign } from '@expo/vector-icons';

const RegisterSpecialist= ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [uen, setUEN] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [firstNameError, setError1] = useState('');
  const [lastNameError, setError2] = useState('');
  const [emailError, setError3] = useState('');
  const [uenError, setError4] = useState('');
  const [pwError, setError5] = useState('');
  const [confirmPwError, setError6] = useState('');

  const handleRegistration = async () => {
    let valid = true; 

    try {
      // Handle Name Errors
      if (!firstName) {
        // Check if empty
        setError1('* Required field');
        valid = false;
      }
      else if ((!/^[a-zA-Z\-]+$/.test(firstName))) {
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
      if (!email) {
        setError3('* Required field');
        valid = false;
      }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError3('* Invalid email format');
        valid = false;
      }
      else {
        setError3('');
      }

      // Handle UEN errors
      // types: (1) nnnnnnnnX (9 digits) (2) yyyynnnnnX (10 digits) (3) TyyPQnnnnX (10 digits)
      /* 
        ‘n’ = a number
        ‘P’= a alphabetical letter
        ‘Q’ = an alpha-numeric digit
        ‘PQ’ = Entity-type 2
        ‘Tyy’ / ‘Syy’ / ‘yyyy’= year of issuance 
        ‘X’ = a check alphabet
      */
      if (!uen) {
        setError4('* Required field');
        valid = false;
      }
      else if (!/^[0-9]{8}[A-Za-z]$/.test(uen) || !/^[A-Za-z]{4}[0-9]{5}[A-Za-z]$/.test(uen) || !/^(T|S|20)\d{2}[A-Za-z0-9]{2}[A-Za-z]$/.test(uen)) {
        setError4('* Invalid UEN');
        valid = false;
      }
      else {
        setError4('');
      }

      // Handle Password Errors
      if (!password || !confirmPw) {
         // Check if empty
        setError5('* Required field');
        setError6('* Required field');
        valid = false;
      }
      else if (password !== confirmPw) {
        // Check if passwords match
        setError5('* Password do not match');
        setError6('* Password do not match');
        valid = false;
      }
      else {
        setError5('');
        setError6('');
      }

      if (valid) {
        // Call Firebase function to create user with email and password
        const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email, password);
        
        // Navigate to the home screen
        navigation.navigate("RegisteredHome");
      }
    } catch (error) {
      console.error('Registration error:', error.message);
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
        <Text style={[styles.titleNote, { marginBottom: 30}]}> Register as a specialist </Text>

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
            <Text style= {[styles.formText, {marginBottom: 10}]}> UEN {uenError ? <Text style={styles.error}>{uenError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value = {uen} onChangeText = {setUEN}/>
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Password {pwError ? <Text style={styles.error}>{pwError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={password} onChangeText={setPassword} secureTextEntry={true} textContentType={'oneTimeCode'} />
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Confirm Password {confirmPwError ? <Text style={styles.error}>{confirmPwError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry={true} textContentType={'oneTimeCode'} />
          </View>
        </View>

        {/* Button */}
        <Pressable style={[styles.button4, { marginBottom: 20, alignSelf: 'center' }]} onPress={handleRegistration}>
          <Text style={styles.text}> Register </Text>
        </Pressable>

        <Pressable style={[styles.formText, { marginBottom: 20, alignSelf: 'center' }]} onPress={() => navigation.navigate("AccountType")}>
          <Text style={styles.buttonText}> Register as different user </Text>
        </Pressable>

        <Pressable style={[styles.formText, { marginBottom: 20, alignSelf: 'center' }]} onPress={() => navigation.navigate("Login")}>
          <Text>Already have an account? <Text style={styles.buttonText}>Login</Text></Text>
        </Pressable>
      </ScrollView>
    </Keyboard>
  );
};

export default RegisterSpecialist;