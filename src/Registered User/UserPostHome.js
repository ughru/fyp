import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import url from '../components/config';

const UserPostHome = ({navigation}) => {
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

      <Text style={[styles.text, {top: 170, left: 20}]}> Upcoming Appointments </Text>
      <Pressable style={[ {top: 170, left: 110}]}>
        <Text style={styles.formText}> See All </Text>
      </Pressable>

      <View style={[styles.search, {top: 240, left: 30}]}>
        <Pressable style={styles.button4}>
            <View style={[styles.iconContainer, {left: 20}]}>
              <Feather name="calendar" size={24} color="black" />
            </View>
        </Pressable>
        <Text style={styles.textInputWithIcon2}> </Text>
      </View>

      <View style={[styles.iconContainer, {top: 320, left: 20}]}>
        <Ionicons name="scale-outline" size={24} color="black" />
      </View>
      <Pressable style={[styles.formText, {top: 322, left: 50}]}>
        <Text style={styles.questionText}> Weight Tracker </Text>
      </Pressable>

      <Text style={[styles.titleNote, {top: 370, left: 20}]}> Suggested for you </Text>

      <Pressable style={[styles.button, {top: 700}]}>
        <Text style={styles.text}> See more </Text>
      </Pressable>
    </ScrollView>
    </Keyboard>
  );
};

export default UserPostHome;
