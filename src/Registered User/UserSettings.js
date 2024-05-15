import React from 'react';
import { View, Text, Pressable, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import axios from 'axios';
import url from "../components/config";

const UserSettings  = ({navigation, selectedStatus, setSelectedStatus}) => {
    const handleStatusSelection = async (status) => {
      setSelectedStatus(status);
  
      // Store user selection locally
      try {
        await AsyncStorage.setItem('selectedStatus', status);
      } catch (error) {
        console.error('Error storing selected status:', error);
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

        <Text style= {[styles.questionText, {top: 170, left: 20}]}> Profile </Text>
        <Text style= {[styles.text, {top: 210, left: 20}]}> First Name </Text>
        <TextInput style={[styles.input2, {top: 200, left: 120}]}/>
        <Text style= {[styles.text, {top: 260, left: 20}]}> Last Name</Text>
        <TextInput style={[styles.input2, {top: 250, left: 120}]}/>
        <Text style= {[styles.text, {top: 310, left: 20}]}> Email </Text>
        <TextInput style={[styles.input2, {top: 300, left: 120}]}/>
        <Text style= {[styles.text, {top: 360, left: 20}]}> Password </Text>
        <TextInput style={[styles.input2, {top: 350, left: 120}]}/>
  
        <Text style= {[styles.questionText, {top: 420, left: 20}]}> Pregnancy Status </Text>
        <Pressable
          style={[
            styles.button6,
            { top: 460, left: 20 },
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
            { top: 460, left: 120 },
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
            { top: 460, left: 220 },
            selectedStatus === 'Post' ? styles.button6 : styles.defaultButton,
          ]}
          disabled={!selectedStatus}
          onPress={() => handleStatusSelection('Post')}
        >
          <Text>{selectedStatus === 'Post' ? 'Post' : 'Post'}</Text>
        </Pressable>

        <Text style= {[styles.questionText, {top: 510, left: 20}]}> Others </Text>
        <Pressable style={[styles.formText, {top: 550, left: 25}]} onPress={() => navigation.navigate("Appointments")}>
          <Text style={styles.text}> Appointments </Text>
        </Pressable>
        <Pressable style={[styles.formText, {top: 590, left: 25}]} onPress={() => navigation.navigate("LogPeriod")}>
          <Text style={styles.text}> Log Period </Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable style={[styles.formText, {top: 630, left: 20}]} onPress={handleLogout}>
          <Text style={styles.questionText}>Logout</Text>
      </Pressable>
      </View>
    );
  };

export default UserSettings;