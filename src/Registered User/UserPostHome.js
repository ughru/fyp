import React, { useEffect, useState, useRef} from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { fetchResources } from '../components/manageResource';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};  

const UserPostHome = ({navigation}) => {
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
      <View style={[styles.container3, { marginTop: 50 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, { marginTop: 20 }]}>Welcome, {userInfo.firstName}!</Text>
      </View>

      <View style={[styles.container3, { marginBottom: 80}]}>
        <Text style={[styles.text, { marginBottom: 10 }]}>Upcoming Appointments</Text>
        <View style={[styles.button4, {marginTop: 20, marginBottom: 40, flexDirection: 'row', alignItems: 'center', alignContent: 'center'}]}>
          <Feather name="calendar" size={24} color="black" style= {{}} />
          <Text style={styles.textInputWithIcon2}>No Appointments Yet</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
          <Ionicons name="scale-outline" size={24} color="black" style={{ marginRight: 10 }} />
          <Pressable onPress={() => navigation.navigate("WeightTracker")}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>

        <Text style={[styles.titleNote, { marginBottom: 20 }]}>Suggested for you</Text>
      </View>

      {/* Dynamically get 10 recommended resources */}
      <View style={[styles.buttonContainer, { marginBottom: 20}]}>
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

export default UserPostHome;
