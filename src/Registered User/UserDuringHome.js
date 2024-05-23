import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import url from '../components/config';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};  

const UserDuringHome = ({navigation}) => {
  const [currentDate, setCurrentDate] = useState(null);
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
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    const formatDate = (date) => {
      const day = (`0${date.getDate()}`).slice(-2);
      const month = (`0${date.getMonth() + 1}`).slice(-2);
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };

    const date = new Date();
    const formattedDate = formatDate(date);
    setCurrentDate(formattedDate);

    fetchUserInfo();
  }, []);

 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.iconContainer, {top: 80, left: 330}]}>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </View>
      <Text style={[styles.date, {top: 80, left: 20}]}> {currentDate} </Text>
      <Text style={[styles.textTitle, { top: 120, left: 20 }]}>Welcome, {userInfo.firstName}!</Text>

      <Text style={[styles.formText, {top: 170, left: 150}]}> You are Pregnant for </Text>
      <Text style={[styles.questionText, {top: 210, left: 150}]}> Weeks </Text>
      <Pressable style={[styles.button3, {top: 280, left: 150}]}>
        <Text style={styles.text}> Details </Text>
      </Pressable>

      <View style={[styles.iconContainer, {top: 350, left: 20}]}>
        <Ionicons name="scale-outline" size={24} color="black" />
      </View>
      <Pressable style={[styles.formText, {top: 352, left: 50}]} onPress={() => navigation.navigate("WeightTracker")}>
        <Text style={styles.questionText}> Weight Tracker </Text>
      </Pressable>

      <Text style={[styles.titleNote, {top: 400, left: 20}]}> What to expect </Text>

      <Pressable style={[styles.button, {top: 700}]}>
        <Text style={styles.text}> See more </Text>
      </Pressable>
    </ScrollView>
    </Keyboard>
  );
};

export default UserDuringHome;
