import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { fetchResources } from '../components/manageResource';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};  

const UserDuringHome = ({navigation}) => {
  const [currentDate, setCurrentDate] = useState(null);
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

    // Call all functions
    fetchUserInfo();
    fetchAndSetResources();
    setCurrentDateFormatted();
  }, []);

 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[styles.container3, { top: 50, marginBottom: 20  }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, { marginTop: 20 }]}>Welcome, {userInfo.firstName}!</Text>
    </View>

    <View style={[styles.container3, { marginBottom: 20}]}>
      <Text style={[styles.formText, { marginBottom: 10, alignSelf: 'center' }]}>You are Pregnant for</Text>
      <Text style={[styles.questionText, { marginBottom: 20, alignSelf: 'center' }]}>Weeks</Text>
      <Pressable style={[styles.button3, { alignSelf: 'center', marginBottom: 40 }]} onPress={() => navigation.navigate("Details")}>
        <Text style={styles.text}>Details</Text>
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Ionicons name="scale-outline" size={24} color="black" />
        <Pressable onPress={() => navigation.navigate("WeightTracker")} style={{ marginLeft: 10 }}>
          <Text style={styles.questionText}>Weight Tracker</Text>
        </Pressable>
      </View>

      <Text style={[styles.titleNote, { marginBottom: 20 }]}>What to expect</Text>
    </View>

      {/* Dynamically get 10 recommended resources */}
      <View style={[styles.buttonContainer, { marginBottom: 20 }]}>
        <ScrollView  ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingVertical: 10, marginBottom: 10, paddingRight: 30 }}>
          {resources.map(
            (resource, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resourceBtn}
                  onPress={() => navigation.navigate('UserResourceInfo', { title: resource.title })}
                >
                  <Text>{resource.title}</Text>
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

export default UserDuringHome;
