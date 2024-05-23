import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
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

// Calendar
const getWeek = () => {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentDay = today.getDate();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + i);
    weekDates.push(date.getDate());
  }

  return { weekDays, weekDates, currentDay };
};

const UserPreHome = ({navigation}) => {
  const [currentDate, setCurrentDate] = useState(null);
  const { weekDays, weekDates, currentDay } = getWeek();
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

      {/* Legend */}
      <Pressable style={[styles.button7, {top: 170, left: 30}]}>
      </Pressable>
      <Text style={[styles.text, {top: 172, left: 60}]}> Today </Text>

      <Pressable style={[styles.button8, {top: 170, left: 120}]}>
      </Pressable>
      <Text style={[styles.text, {top: 172, left: 150}]}> Ovulation </Text>

      {/* Calendar */}
      <View style={[styles.calendarContainer, {top: 220, left: 20}]}>
        <View style={styles.header}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>
        <View style={styles.days}>
          {weekDates.map((date, index) => (
            <Text key={index} style={[styles.date2, date === currentDay && styles.currentDate]}>{date}</Text>
          ))}
        </View>
      </View>

      <Pressable style={[styles.button, {top: 300}]} onPress={() => navigation.navigate("LogPeriod")}>
        <Text style={styles.text}> Log Period </Text>
      </Pressable>

      <View style={[styles.iconContainer, {top: 370, left: 20}]}>
        <MaterialIcons name="history" size={24} color="black" />
      </View>
      <Pressable style={[styles.formText, {top: 372, left: 50}]} onPress={() => navigation.navigate("CycleHistory")}>
        <Text style={styles.questionText}> Cycle History</Text>
      </Pressable>
      <View style={[styles.iconContainer, {top: 420, left: 20}]}>
        <Ionicons name="scale-outline" size={24} color="black" />
      </View>
      <Pressable style={[styles.formText, {top: 422, left: 50}]} onPress={() => navigation.navigate("WeightTracker")}>
        <Text style={styles.questionText}> Weight Tracker </Text>
      </Pressable>

      <Text style={[styles.titleNote, {top: 470, left: 20}]}> Suggested for you </Text>

      <Pressable style={[styles.button, {top: 900}]}>
        <Text style={styles.text}> See more </Text>
      </Pressable>
    </ScrollView>
    </Keyboard>
  );
};

export default UserPreHome;