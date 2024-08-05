import React, {useEffect, useState, useCallback} from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import axios from 'axios';
import url from "../components/config";
import { useFocusEffect } from '@react-navigation/native';

const SpecialistSettings= ({navigation}) => {
  const [specialistInfo, setSpecialistInfo] = useState({ firstName: '', lastName: '', contact: '' });

  const fetchSpecialistInfo = useCallback(async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('user');
      if (storedEmail) {
        const response = await axios.get(`${url}/specialistinfo?email=${storedEmail}`);
        if (response.data) {
          setSpecialistInfo(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
}, []);

  useEffect(() => {
    fetchSpecialistInfo();
    }, [fetchSpecialistInfo]);

  useFocusEffect(
    useCallback(() => {
      fetchSpecialistInfo();
    }, [fetchSpecialistInfo])
  );
 
  const handleLogout = async () => {
    try {
      // Make a POST request to the logout endpoint
      await axios.post(`${url}/logout`);

      // Clear AsyncStorage and navigate to the login screen
      await AsyncStorage.clear();
      navigation.navigate('Login', { origin: 'SpecialistSettings' });
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
        <Pressable  style={[styles.button3]} onPress={() => navigation.navigate("SpecialistEditProfile")}>
          <Text style={styles.text}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={[styles.container4, {alignItems: 'center'}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style= {[styles.text]}> First Name </Text>
          <TextInput style={[styles.input2]} value={specialistInfo.firstName} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text]}> Last Name </Text>
          <TextInput style={[styles.input2]} value={specialistInfo.lastName} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text]}> Contact No </Text>
          <TextInput style={[styles.input2]} value={specialistInfo.contact} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text]}> UEN </Text>
          <TextInput style={[styles.input2]} value={specialistInfo.uen} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text]}> Email </Text>
          <TextInput style={[styles.input2]} value={specialistInfo.email} />
        </View>
      </View>

      <View style = {[styles.container4]}>
        <Text style= {[styles.questionText, {marginBottom: 20}]}> Others </Text>
        <Pressable style={[styles.formText, {marginBottom: 20}]} onPress={() => navigation.navigate("Resources")}>
          <Text style={styles.text}> Resources </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 20}]} onPress={() => navigation.navigate("Appointments")}>
          <Text style={styles.text}> Appointments </Text>
        </Pressable>

        <Text style= {[styles.questionText, {marginBottom: 20}]}> Info and Support </Text>
        <Pressable style={[styles.formText, {marginBottom: 20}]} onPress={() => navigation.navigate("ForgetPw", { origin: 'SpecialistSettings' })}>
          <Text style={styles.text}> Change Password </Text>
        </Pressable>
        <Pressable style={[styles.formText, {marginBottom: 20}]}>
          <Text style={styles.text}> Report a Problem </Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable style={[styles.formText]} onPress={handleLogout}>
          <Text style={styles.questionText}>Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default SpecialistSettings;