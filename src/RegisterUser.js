import React, { useState, useEffect } from 'react';
import { Text, Pressable, TextInput, ScrollView, View , Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import axios from 'axios';
import url from "./components/config";
import { AntDesign } from '@expo/vector-icons';

const RegisterUser= ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [firstNameError, setError1] = useState('');
  const [lastNameError, setError2] = useState('');
  const [emailError, setError3] = useState('');
  const [pwError, setError4] = useState('');
  const [confirmPwError, setError5] = useState('');
  const [contactError, setError6] = useState('');

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selections, setSelections] = useState({});
  const [registrationInProgress, setRegistrationInProgress] = useState(false);

  useEffect(() => {
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

    const fetchSelections = async() => {
      try {
        const storedSelections = await AsyncStorage.getItem('userSelections');
        if (storedSelections !== null) {
          setSelections(storedSelections);
        }
      } catch (error) {
        console.error('Error retrieving personalisation response:', error);
      }
    };

    fetchSelectedStatus();
    fetchSelections();
  }, []);

  const handleRegistration = async () => {
    let valid = true;
    setRegistrationInProgress(true);

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      contact: contact,
      password,
      status: selectedStatus, 
      state: "active",
    };

    const personalisationData = {
      userEmail: email.trim(),
      personalisation: selections, 
    };

    try {
      // Validate First Name
      if (!firstName.trim()) {
        setError1('* Required field');
        valid = false;
      } else if (firstName[0] !== firstName[0].toUpperCase()) {
        setError1('* First letter must be uppercase');
        valid = false;
      } else if (!/^[a-zA-Z ]+$/.test(firstName)) {
        setError1('* Invalid First Name');
        valid = false;
      } else if (firstName.length < 2) {
        setError1('* Minimum 2 characters');
        valid = false;
      } else {
        setError1('');
      }

      // Validate Last Name
      if (!lastName.trim()) {
        setError2('* Required field');
        valid = false;
      } else if (lastName[0] !== lastName[0].toUpperCase()) {
        setError2('* First letter must be uppercase');
        valid = false;
      } else if (!/^[a-zA-Z\-]+$/.test(lastName)) {
        setError2('* Invalid Last Name');
        valid = false;
      } else if (lastName.length < 2) {
        setError2('* Minimum 2 characters');
        valid = false;
      } else {
        setError2('');
      }

      // Validate Email
      if (!email.trim()) {
        setError3('* Required field');
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError3('* Invalid email format');
        valid = false;
      } else {
        setError3('');
      }

      const phoneNoCheck = /^(8\d{3}\d{4}|9[0-8]\d{2}\d{4})$/;
      if(!contact.trim()) {
        setError6('* Required field');
        valid = false;
      } else if (!phoneNoCheck.test(contact)) {
        setError6('* Invalid phone number');
        valid = false;
      } else {
        setError6('');
      }

      const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

      // Validate Password
      if (!password.trim() || !confirmPw.trim()) {
        setError4('* Required field');
        setError5('* Required field');
        valid = false;
      } else if (password !== confirmPw) {
        setError4('* Passwords do not match');
        setError5('* Passwords do not match');
        valid = false;
      } else {
        // Validate Password
        let validPassword = true;
        if (!strongPasswordRegex.test(password)) {
          setError4(`* Password must be: \n - At least 8 characters long \n - Contain an uppercase letter \n - Contain a lowercase letter \n - Contain a number \n - Contain a special character`);
          validPassword = false;
          valid = false;
        } else {
          setError4('');
        }
        
        // Validate Confirm Password
        if (!validPassword || !strongPasswordRegex.test(confirmPw)) {
          setError5(`* Password must be: \n - At least 8 characters long \n - Contain an uppercase letter \n - Contain a lowercase letter \n - Contain a number \n - Contain a special character`);
          valid = false;
        } else {
          setError5('');
        }
      }

      if (valid) {
        try {
          await auth.createUserWithEmailAndPassword(email, password);

          await AsyncStorage.setItem('user', email);

          const response = await axios.post(`${url}/register`, userData);
          await axios.post(`${url}/personalise`, personalisationData);

          if (response.data && response.data.error === 'User already exists!') {
            setError3('* User already exists');
            return;
          }

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
            <Text style={[styles.formText, {marginBottom: 10}]}> Contact Number {contactError ? <Text style={styles.error}>{contactError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={contact} onChangeText={setContact} placeholder="+65" placeholderTextColor= "grey" keyboardType="numeric"/>
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Email {emailError ? <Text style={styles.error}>{emailError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={email} onChangeText={setEmail} keyboardType="email-address" />
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Password </Text>
            {pwError ? <Text style={[styles.error, {fontSize: 16, marginBottom: 10}]}>{pwError}</Text> : null}
            <TextInput style={[styles.input]} value={password} onChangeText={setPassword} secureTextEntry={true} textContentType={'oneTimeCode'}/>
          </View>
    
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Confirm Password </Text>
            {confirmPwError ? <Text style={[styles.error, {fontSize: 16, marginBottom: 10}]}>{confirmPwError}</Text> : null}
            <TextInput style={[styles.input]} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry={true} textContentType={'oneTimeCode'}/>
          </View>
        </View>
  
        {/* Register Button */}
        <Pressable style={[styles.button4, { marginBottom: 20, alignSelf: 'center' }]} onPress={handleRegistration}>
          <Text style={styles.text}> Register </Text>
        </Pressable>
  
        {/* Already have an account? Login */}
        <Pressable style={[styles.formText, { marginBottom: 20, alignSelf: 'center' }]} onPress={() => navigation.navigate("Login", { origin: 'RegisterUser' })}>
          <Text style= {styles.text}>Already have an account? <Text style={styles.buttonText}>Login</Text></Text>
        </Pressable>
      </ScrollView>
    </Keyboard>
  );
};


export default RegisterUser;