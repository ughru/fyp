import React, {useEffect, useState, useCallback} from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import axios from 'axios';
import url from "../components/config";
import { useFocusEffect } from '@react-navigation/native';

const AdminSettings= ({navigation}) => {
  const [adminInfo, setAdminInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const fetchAdminInfo = useCallback(async () => {
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
}, []);

  useEffect(() => {
    fetchAdminInfo();
    }, [fetchAdminInfo]);

  useFocusEffect(
    useCallback(() => {
      fetchAdminInfo();
    }, [fetchAdminInfo])
  );
 
  const handleLogout = async () => {
    try {
      // Make a POST request to the logout endpoint
      await axios.post(`${url}/logout`);

      // Clear AsyncStorage and navigate to the login screen
      await AsyncStorage.clear();
      navigation.navigate('Login', { origin: 'AdminSettings' });
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={[styles.pageTitle, Platform.OS!=="web"&&{paddingTop:50}]}> Settings </Text>
    <Text style={[styles.titleNote, {paddingTop:10 , paddingBottom:20}]}> Manage your account </Text>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
      <Text style= {[styles.questionText]}> Profile </Text>
      <Pressable  style={[styles.button3]} onPress={() => navigation.navigate("AdminEditProfile")}>
        <Text style={styles.text}>Edit Profile</Text>
      </Pressable>
    </View>

      <View style={[styles.container4, {alignItems: 'center'}]}>
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

      <View style = {[styles.container4]}>
        <Text style= {[styles.questionText, {marginBottom: 20}]}> Others </Text>
        <Pressable style={[styles.formText, {marginBottom: 20}]} onPress={() => navigation.navigate("Forum")}>
          <Text style={styles.text}> Community Forum </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 20}]}>
          <Text style={styles.text}> Advertisement </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 20}]}>
          <Text style={styles.text}> Manage Users </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 20}]}>
          <Text style={styles.text}> Manage Reports </Text>
        </Pressable>

        <Text style= {[styles.questionText, {marginBottom: 20}]}> Info and Support </Text>
        <Pressable style={[styles.formText, {marginBottom: 20}]} onPress={() => navigation.navigate("ForgetPw", { origin: 'AdminSettings' })}>
          <Text style={styles.text}> Change Password </Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable style={[styles.formText]} onPress={handleLogout}>
          <Text style={styles.questionText}>Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AdminSettings;