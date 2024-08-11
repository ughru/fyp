import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import own code
import styles from '../components/styles';
import Keyboard from '../components/Keyboard'; 
import url from "../components/config";

const showAlert = (title, message, onConfirm = () => {}) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) {
        onConfirm();
      } 
    } else {
      Alert.alert(title, message, [
        { text: 'OK', onPress: onConfirm }
      ]);
    }
};

const AdminEditProfile = ({ navigation }) => {
    // values
    const [userInfo, setUserInfo] = useState([]);

    const [firstNameError, setError1] = useState('');
    const [lastNameError, setError2] = useState('');

    // Handle input changes
    const handleChange = (name, value) => {
        setUserInfo({ ...userInfo, [name]: value });
    };

    // Fetch user email
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('user');
                if (storedEmail) {
                const response = await axios.get(`${url}/admininfo?email=${storedEmail}`);
                if (response.data) {
                    setUserInfo(response.data);
                }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
            };
    
        fetchUserInfo();
    }, []);

    const onEditProfile = async () => {
        let valid = true;

        // Validate First Name
        if (!userInfo.firstName.trim()) {
            setError1('* Required field');
            valid = false;
        } else if (!/^[a-zA-Z ]+$/.test(userInfo.firstName)) {
            setError1('* Invalid First Name');
            valid = false;
        } else if (userInfo.firstName.length < 2) {
            setError1('* Minimum 2 characters');
            valid = false;
        } else {
            setError1('');
        }

        // Validate Last Name
        if (!userInfo.lastName.trim()) {
            setError2('* Required field');
            valid = false;
        } else if (!/^[a-zA-Z\-]+$/.test(userInfo.lastName)) {
            setError2('* Invalid Last Name');
            valid = false;
        } else if (userInfo.lastName.length < 2) {
            setError2('* Minimum 2 characters');
            valid = false;
        } else {
            setError2('');
        }

        if (valid) {
            try {
                const storedEmail = await AsyncStorage.getItem('user');
                if (storedEmail) {
                    const response = await axios.put(`${url}/editAdmin?email=${storedEmail}`, userInfo);
                    await AsyncStorage.setItem('user', userInfo.email);
                    showAlert('Profile updated successfully', '', () => {navigation.goBack();});
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showAlert('Error updating profile');
            }
        }
    };

    return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
            <Text style={[styles.pageTitle]}> Edit Profile </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                    <Entypo name="cross" size={30} color="black" />
                </Pressable>
            </View>
        </View>

        {/* Form fields */}
        <View style={[styles.container4, {marginLeft: 5}]}>
            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.formText, {marginBottom: 10}]}> First Name {firstNameError ? <Text style={styles.error}>{firstNameError}</Text> : null} </Text>
                <TextInput style={[styles.input]} value={userInfo.firstName} onChangeText={(text) => handleChange('firstName', text)} />
            </View>

            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.formText, {marginBottom: 10}]}> Last Name {lastNameError ? <Text style={styles.error}>{lastNameError}</Text> : null} </Text>
                <TextInput style={[styles.input]} value={userInfo.lastName} onChangeText={(text) => handleChange('lastName', text)}/>
            </View>
        </View>

        {/* Update Button */}
        <View style={[styles.container3, { marginBottom: 20 }]}>
            <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={onEditProfile}>
                <Text style={styles.text}> Update </Text>
            </Pressable>
        </View>
        
    </ScrollView>
    </Keyboard>
    );
};

export default AdminEditProfile;