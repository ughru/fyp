import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { fetchResources } from '../components/manageResource';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

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

const UserPreHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const { weekDays, weekDates, currentDay } = getWeek();
  const [resources, setResources] = useState([]);
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const scrollRef = useRef(null);

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

    const fetchAndSetResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    };

    const setCurrentDateFormatted = () => {
      const date = new Date();
      const formattedDate = formatDate(date);
      setCurrentDate(formattedDate);
    };

    fetchUserInfo();
    fetchAndSetResources();
    setCurrentDateFormatted();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
     <View style={[styles.container4, { ...Platform.select({ web: {}, default: { paddingTop: 50 } }) }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, {paddingTop: 10}]}>Welcome, {userInfo.firstName}!</Text>
      </View>

      <View style={[styles.container4]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable style={styles.button7} />
          <Text style={[styles.text, { marginLeft: 10 }]}>Today</Text>
          <Pressable style={[styles.button8, { marginLeft: 30 }]} />
          <Text style={[styles.text, { marginLeft: 10 }]}>Ovulation</Text>
        </View>

        <View style={[styles.calendarContainer]}>
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

        <Pressable style={[styles.button, { alignSelf: 'center', marginTop: 20, marginBottom: 20 }]} onPress={() => navigation.navigate("LogPeriod")}>
          <Text style={styles.text}>Log Period</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <MaterialIcons name="history" size={24} color="black" />
          <Pressable onPress={() => navigation.navigate("CycleHistory")} style={{ marginLeft: 10 }}>
            <Text style={styles.questionText}>Cycle History</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="scale-outline" size={24} color="black" />
          <Pressable onPress={() => navigation.navigate("WeightTracker")} style={{ marginLeft: 10 }}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>

        <Text style={[styles.titleNote, { marginBottom: 20 }]}>Suggested for you</Text>
      </View>

      <View>
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingVertical: 10 }}>
          {resources.map(
            (resource, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceBtn}
                onPress={() => navigation.navigate('UserResourceInfo', { resourceID: resource.resourceID })}
              >
                <View style= {{flex: 1, justifyContent: 'flex-end'}}>
                  <Text style= {[styles.text]} ellipsizeMode='tail'>{resource.title}</Text>
                </View>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => navigation.navigate("Resources")}>
        <Text style={styles.text}>See more</Text>
      </Pressable>
    </ScrollView>
  );
};

export default UserPreHome;