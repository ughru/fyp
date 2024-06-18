import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import axios from 'axios';
import url from "../components/config";

const UserSettings  = ({navigation, selectedStatus, setSelectedStatus}) => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    uen: '',
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

  const clearAsyncStorageExcept = async (keysToKeep) => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToDelete = allKeys.filter(key => !keysToKeep.includes(key));
      await AsyncStorage.multiRemove(keysToDelete);
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Make a POST request to the logout endpoint
      await axios.post(`${url}/logout`);

      // Clear AsyncStorage and navigate to the login screen
      await clearAsyncStorageExcept(['resourceDate', 'resources']);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };
  
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.pageTitle, Platform.OS!=="web"&&{paddingTop:50}]}> Settings </Text>
      <Text style={[styles.titleNote, {paddingTop:10 , paddingBottom:10}]}> Manage your account </Text>

      <Text style= {[styles.questionText, {marginBottom: 20}]}> Profile </Text>

      <View style={[styles.container4, {alignItems: 'center'}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style= {[styles.text]}> First Name </Text>
          <TextInput style={[styles.input2]} value={userInfo.firstName} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text]}> Last Name </Text>
          <TextInput style={[styles.input2]} value={userInfo.lastName} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text]}> Email </Text>
          <TextInput style={[styles.input2]} value={userInfo.email} />
        </View>
      </View>

      <View style = {[styles.container4]}>
        <Text style={[styles.questionText, {marginBottom: 20}]}> Pregnancy Status </Text>
        <View style={[styles.buttonPosition, {marginBottom: 20}]}>
          <Pressable
            style={[
              styles.button6, {marginHorizontal: 10},
              selectedStatus === 'Pre' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('Pre')}
          >
            <Text>{selectedStatus === 'Pre' ? 'Pre' : 'Pre'}</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button6, {marginHorizontal: 10},
              selectedStatus === 'During' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('During')}
          >
            <Text>{selectedStatus === 'During' ? 'During' : 'During'}</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button6, {marginHorizontal: 10},
              selectedStatus === 'Post' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('Post')}
          >
            <Text>{selectedStatus === 'Post' ? 'Post' : 'Post'}</Text>
          </Pressable>
        </View>

        <Text style= {[styles.questionText, {marginBottom: 20}]}> Others </Text>
        <Pressable style={[styles.formText, {marginBottom: 20}]} onPress={() => navigation.navigate("Appointments")}>
          <Text style={styles.text}> Appointments </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 20}]} onPress={() => navigation.navigate("LogPeriod")}>
          <Text style={styles.text}> Log Period </Text>
        </Pressable>

        <Text style= {[styles.questionText, {marginBottom: 20}]}> Info and Support </Text>
        <Pressable style={[styles.formText, {marginBottom: 20}]}>
          <Text style={styles.text}> Change Password </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 20}]}>
          <Text style={styles.text}> Report a Problem </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 20}]}>
          <Text style={styles.text}> Downloads </Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable style={[styles.formText]} onPress={handleLogout}>
          <Text style={styles.questionText}>Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default UserSettings;