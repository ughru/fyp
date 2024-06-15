import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import axios from 'axios';
import url from "../components/config";

const AdminSettings= ({navigation}) => {
  const [adminInfo, setAdminInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user');
        if (storedEmail) {
          const response = await axios.get(`${url}/admininfo?email=${storedEmail}`);
          if (response.data) {
            setAdminInfo(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchAdminInfo();
  }, []);
 
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
      <Text style={[styles.pageTitle, {top: 50, marginBottom: 20}]}> Settings </Text>
      <Text style={[styles.titleNote, {marginTop: 40, marginBottom: 20}]}> Manage your account </Text>

      <Text style= {[styles.questionText, {marginBottom: 20}]}> Profile </Text>

      <View style={[styles.container3, {alignItems: 'center'}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style= {[styles.text]}> First Name </Text>
          <TextInput style={[styles.input2]} value={adminInfo.firstName} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text]}> Last Name </Text>
          <TextInput style={[styles.input2]} value={adminInfo.lastName} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text]}> Email </Text>
          <TextInput style={[styles.input2]} value={adminInfo.email} />
        </View>
      </View>

      <View style = {[styles.container3, {marginBottom: 250}]}>
        <Text style= {[styles.questionText, {marginBottom: 30}]}> Others </Text>
        <Pressable style={[styles.formText, {marginBottom: 30}]} onPress={() => navigation.navigate("Forum")}>
          <Text style={styles.text}> Community Forum </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 30}]}>
          <Text style={styles.text}> Advertisement </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 30}]}>
          <Text style={styles.text}> Manage Users </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 30}]}>
          <Text style={styles.text}> Manage Reports </Text>
        </Pressable>

        <Text style= {[styles.questionText, {marginBottom: 30}]}> Info and Support </Text>
        <Pressable style={[styles.formText, {marginBottom: 30}]}>
          <Text style={styles.text}> Change Password </Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable style={[styles.formText, {marginBottom: 30}]} onPress={handleLogout}>
          <Text style={styles.questionText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default AdminSettings;