import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import axios from 'axios';
import url from "../components/config";

const UserSettings  = ({navigation, selectedStatus, setSelectedStatus}) => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user');
        if (storedEmail) {
          const response = await axios.get(`${url}/userinfo?email=${storedEmail}`);
          if (response.data) {
            setUserInfo(response.data);
            setSelectedStatus(response.data.status);
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);
  
  const handleStatusSelection = async (status) => {
    try {
      const email = userInfo.email;
      const response = await axios.post(`${url}/updateStatus`, { email, status });
      if (response.data) {
        setSelectedStatus(status);

        // Store user selection locally
        await AsyncStorage.setItem('selectedStatus', status);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Make a POST request to the logout endpoint
      await axios.post(`${url}/logout`);

      // Clear AsyncStorage and navigate to the login screen
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };
  
  // Page Displays
  return (
    <View style={styles.container}>
      <Text style= {[styles.pageTitle, {top: 80, left: 20}]}> Settings </Text>
      <Text style= {[styles.titleNote, { top: 120, left: 20}]}> Manage your account </Text>

      <Text style= {[styles.questionText, {top: 160, left: 20}]}> Profile </Text>
      <Text style= {[styles.text, {top: 200, left: 20}]}> First Name </Text>
      <TextInput style={[styles.input2, { top: 190, left: 120 }]} value={userInfo.firstName} />
      <Text style={[styles.text, { top: 250, left: 20 }]}> Last Name</Text>
      <TextInput style={[styles.input2, { top: 240, left: 120 }]} value={userInfo.lastName} />
      <Text style={[styles.text, { top: 300, left: 20 }]}> Email </Text>
      <TextInput style={[styles.input2, { top: 290, left: 120 }]} value={userInfo.email} />

      <Text style= {[styles.questionText, {top: 350, left: 20}]}> Pregnancy Status </Text>
      <Pressable
        style={[
          styles.button6,
          { top: 390, left: 20 },
          selectedStatus === 'Pre' ? styles.button6 : styles.defaultButton,
        ]}
        disabled={!selectedStatus}
        onPress={() => handleStatusSelection('Pre')}
      >
        <Text>{selectedStatus === 'Pre' ? 'Pre' : 'Pre'}</Text>
      </Pressable>

      <Pressable
        style={[
          styles.button6,
          { top: 390, left: 120 },
          selectedStatus === 'During' ? styles.button6 : styles.defaultButton,
        ]}
        disabled={!selectedStatus}
        onPress={() => handleStatusSelection('During')}
      >
        <Text>{selectedStatus === 'During' ? 'During' : 'During'}</Text>
      </Pressable>

      <Pressable
        style={[
          styles.button6,
          { top: 390, left: 220 },
          selectedStatus === 'Post' ? styles.button6 : styles.defaultButton,
        ]}
        disabled={!selectedStatus}
        onPress={() => handleStatusSelection('Post')}
      >
        <Text>{selectedStatus === 'Post' ? 'Post' : 'Post'}</Text>
      </Pressable>

      <Text style= {[styles.questionText, {top: 440, left: 20}]}> Others </Text>
      <Pressable style={[styles.formText, {top: 480, left: 20}]} onPress={() => navigation.navigate("Appointments")}>
        <Text style={styles.text}> Appointments </Text>
      </Pressable>
      <Pressable style={[styles.formText, {top: 520, left: 20}]} onPress={() => navigation.navigate("LogPeriod")}>
        <Text style={styles.text}> Log Period </Text>
      </Pressable>

      <Text style= {[styles.questionText, {top: 560, left: 20}]}> Info and Support </Text>
      <Pressable style={[styles.formText, {top: 600, left: 20}]}>
        <Text style={styles.text}> Change Password </Text>
      </Pressable>
      <Pressable style={[styles.formText, {top: 640, left: 20}]}>
        <Text style={styles.text}> Report a Problem </Text>
      </Pressable>
      <Pressable style={[styles.formText, {top: 680, left: 20}]}>
        <Text style={styles.text}> Downloads </Text>
      </Pressable>

      {/* Logout Button */}
      <Pressable style={[styles.formText, {top: 720, left: 20}]} onPress={handleLogout}>
        <Text style={styles.questionText}>Logout</Text>
    </Pressable>
    </View>
  );
};

export default UserSettings;