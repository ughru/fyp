import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Pressable, TextInput, ScrollView, View, Platform, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import url from "./components/config";

const { width: screenWidth } = Dimensions.get('window');

const RegisterSpecialist = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [uen, setUEN] = useState('');
  const [specialisation, setSpecialisation] = useState('');
  const [customSpecialisation, setCustomSpecialisation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [firstNameError, setError1] = useState('');
  const [lastNameError, setError2] = useState('');
  const [emailError, setError3] = useState('');
  const [uenError, setError4] = useState('');
  const [specialisationError, setError5] = useState('');
  const [pwError, setError6] = useState('');
  const [confirmPwError, setError7] = useState('');
  const [contactError, setError8] = useState('');

  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [specialisations, setSpecialisations] = useState([]);
  const scrollRef = useRef(null);

  const fetchSpecialisations = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/specialisations`);
      // Sort specialisations alphabetically by name
      const sortedSpecialisations = response.data.sort((a, b) => a.specialisationName.localeCompare(b.specialisationName));
      setSpecialisations(sortedSpecialisations);
    } catch (error) {
      console.error('Error fetching specialisations:', error);
    }
  }, []);  

  useEffect(() => {
    fetchSpecialisations();
  }, [fetchSpecialisations]);

  useFocusEffect(
    useCallback(() => {
      setFirstName('');
      setLastName('');
      setEmail('');
      setUEN('');
      setSpecialisation('');
      setCustomSpecialisation('');
      setPassword('');
      setConfirmPw('');
      setContact('');
      setError1('');
      setError2('');
      setError3('');
      setError4('');
      setError5('');
      setError6('');
      setError7('');
      setError8('');

      fetchSpecialisations();
    }, [fetchSpecialisations])
  );

  const handleSpecialisationSelection = (selectedSpecialisation) => {
    setSpecialisation(selectedSpecialisation);
    setCustomSpecialisation('');
    setError5('');
  };

  const handleRegistration = async () => {
    let valid = true;
    setRegistrationInProgress(true);

    const finalSpecialisation = specialisation || customSpecialisation.trim();

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contact: contact,
      uen: uen.trim(),
      specialisation: finalSpecialisation,
      email: email.trim(),
      password,
      state: "suspended",
    };

    try {
      // Handle Name Errors
      if (!firstName.trim()) {
        // Check if empty
        setError1('* Required field');
        valid = false;
      } else if (firstName[0] !== firstName[0].toUpperCase()) {
        setError1('* First letter must be uppercase');
        valid = false;
      } else if ((!/^[a-zA-Z\-]+$/.test(firstName))) {
        setError1('* Invalid First Name');
        valid = false;
      } else if (firstName.length < 2) {
        setError1('* Minimum 2 characters');
        valid = false;
      } else {
        setError1('');
      }

      // Handle Name Errors
      if (!lastName.trim()) {
        // Check if empty
        setError2('* Required field');
        valid = false;
      } else if (lastName[0] !== lastName[0].toUpperCase()) {
        setError2('* First letter must be uppercase');
        valid = false;
      } else if ((!/^[a-zA-Z\-]+$/.test(lastName))) {
        setError2('* Invalid Last Name');
        valid = false;
      } else if (lastName.length < 2) {
        setError2('* Minimum 2 characters');
        valid = false;
      } else {
        setError2('');
      }

      // Handle Email Errors
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
      if(!contact) {
        setError8('* Required field');
        valid = false;
      } else if (!phoneNoCheck.test(contact)) {
        setError8('* Invalid phone number');
        valid = false;
      } else {
        setError8('');
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
      if (!uen.trim()) {
        setError4('* Required field');
        valid = false;
      } else if (
        !/^[0-9]{8}[A-Za-z]$/.test(uen) &&
        !/^[A-Za-z]{4}[0-9]{5}[A-Za-z]$/.test(uen) &&
        !/^([TS]\d{2})[A-Za-z][A-Za-z0-9]\d{4}[A-Za-z]$/.test(uen)
      ) {
        setError4('* Invalid UEN');
        valid = false;
      } else {
        setError4('');
      }

      // Handle specialisation error
      if (!finalSpecialisation.trim()) {
        setError5('* Required field');
        valid = false;
      } else if (!/^[a-zA-Z\ ]+$/.test(finalSpecialisation)) {
        setError5('* Invalid format');
        valid = false;
      } else {
        setError5('');
      }

      const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      // Handle Password Errors
      // Validate Password
      if (!password.trim() || !confirmPw.trim()) {
        setError6('* Required field');
        setError7('* Required field');
        valid = false;
      } else if (password !== confirmPw) {
        setError6('* Passwords do not match');
        setError7('* Passwords do not match');
        valid = false;
      } else {
        // Validate Password
        let validPassword = true;
        if (!strongPasswordRegex.test(password)) {
          setError6(`* Password must be: \n - At least 8 characters long \n - Contain an uppercase letter \n - Contain a lowercase letter \n - Contain a number \n - Contain a special character`);
          validPassword = false;
          valid = false;
        } else {
          setError6('');
        }
        
        // Validate Confirm Password
        if (!validPassword || !strongPasswordRegex.test(confirmPw)) {
          setError7(`* Password must be: \n - At least 8 characters long \n - Contain an uppercase letter \n - Contain a lowercase letter \n - Contain a number \n - Contain a special character`);
          valid = false;
        } else {
          setError7('');
        }
      }

      if (valid) {
        try {
          await auth.createUserWithEmailAndPassword(email, password);

          await AsyncStorage.setItem('user', email);

          const response = await axios.post(`${url}/registerSpecialist`, userData);

          if (response.data && response.data.error === 'Specialist already exists!') {
            setError3('* Specialist already exists');
          }

          await axios.post(`${url}/saveSpecialisation`, { specialisationName: customSpecialisation });

          navigation.navigate("Login", { origin: 'RegisterSpecialist' });
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
        <View style={[{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, Platform.OS !== "web" && { paddingTop: 50 }]}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>

        {/* Title */}
        <Text style={[styles.pageTitle, { marginBottom: 20 }]}> Get Started </Text>
        <Text style={[styles.titleNote, { marginBottom: 30 }]}> Register as a specialist </Text>

        {/* Form */}
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, { marginBottom: 10 }]}> First Name {firstNameError ? <Text style={styles.error}>{firstNameError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={firstName} onChangeText={setFirstName} />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, { marginBottom: 10 }]}> Last Name {lastNameError ? <Text style={styles.error}>{lastNameError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={lastName} onChangeText={setLastName} />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, {marginBottom: 10}]}> Contact Number {contactError ? <Text style={styles.error}>{contactError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={contact} onChangeText={setContact} placeholder="+65" placeholderTextColor= "grey" keyboardType="numeric"/>
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, { marginBottom: 10 }]}> Email {emailError ? <Text style={styles.error}>{emailError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={email} onChangeText={setEmail} keyboardType="email-address" />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, { marginBottom: 10 }]}> UEN {uenError ? <Text style={styles.error}>{uenError}</Text> : null} </Text>
            <TextInput style={[styles.input]} value={uen} onChangeText={setUEN} />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={[styles.formText, { marginBottom: 20, marginLeft: 20 }]}> Specialisation {specialisationError ? <Text style={styles.error}>{specialisationError}</Text> : null} </Text>
            {specialisations.length > 0 ? (
              <View>
              <View style={[styles.buttonContainer, {
                ...Platform.select({
                  web:{width:screenWidth*0.9, left: 20 , paddingRight:10},
                  default:{left: 20 , paddingRight:10}
                }) }]}>
              <ScrollView  ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
                style={Platform.OS === 'web'? {width:'100%'}:{width:screenWidth * 0.9}}
                contentContainerStyle={[{ gap: 10, marginBottom: 10 }, Platform.OS!=='web' && {paddingRight:10}]}>
                {specialisations.map((item, index) => (
                  <TouchableOpacity key={index}
                    style={[specialisation === item.specialisationName ? styles.categoryBtnActive : styles.categoryBtn]}
                    onPress={() => handleSpecialisationSelection(item.specialisationName)}>
                    <Text style={styles.text}>{item.specialisationName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
                <Text style={[styles.formText, { marginTop: 20, marginLeft: 20 }]}>Or enter a custom specialisation</Text>
                <TextInput
                  style={[styles.input, { marginTop: 10, marginLeft: 20 }]}
                  value={customSpecialisation}
                  onChangeText={setCustomSpecialisation}
                  placeholder="Custom Specialisation"
                  onFocus={() => setSpecialisation('')}
                />
            </View>
            ) : (
              <TextInput style={[styles.input]} value={specialisation} onChangeText={setSpecialisation} />
            )}
            </View>
          </View>

          <View style={{ marginBottom: 30, alignItems: 'center'}}>
            <Text style={[styles.formText, {alignSelf: 'flex-start', marginLeft: 12, marginBottom: 10}]}> Password </Text>
            {pwError ? <Text style={[styles.error, {alignSelf: 'flex-start', marginLeft: 12, fontSize: 16, marginBottom: 10}]}>{pwError}</Text> : null}
            <TextInput style={[styles.input]} value={password} onChangeText={setPassword} secureTextEntry={true} textContentType={'oneTimeCode'} />
          </View>

          <View style={{ marginBottom: 30, alignItems: 'center' }}>
            <Text style={[styles.formText, {alignSelf: 'flex-start', marginLeft: 12, marginBottom: 10}]}> Confirm Password </Text>
            {confirmPwError ?<Text style={[styles.error, {alignSelf: 'flex-start', marginLeft: 12, fontSize: 16, marginBottom: 10}]}>{confirmPwError}</Text> : null}
            <TextInput style={[styles.input]} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry={true} textContentType={'oneTimeCode'} />
          </View>

        {/* Button */}
        <Pressable style={[styles.button4, { marginBottom: 20, alignSelf: 'center' }]} onPress={handleRegistration}>
          <Text style={styles.text}> Register </Text>
        </Pressable>

        <Pressable style={[styles.formText, { marginBottom: 20, alignSelf: 'center' }]} onPress={() => navigation.navigate("Login", { origin: 'RegisterSpecialist' })}>
          <Text style= {styles.text}>Already have an account? <Text style={styles.buttonText}>Login</Text></Text>
        </Pressable>
      </ScrollView>
    </Keyboard>
  );
};

export default RegisterSpecialist;