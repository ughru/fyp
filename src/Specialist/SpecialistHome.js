import React, { useEffect, useState} from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const SpecialistHome = ({navigation}) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [specialistInfo, setSpecialistInfo] = useState({
    firstName: '',
    lastName: '',
    uen: '',
    email: ''
  });

  useEffect(() => {
    const fetchSpecialistInfo = async () => {
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
    };

    const setCurrentDateFormatted = () => {
      const date = new Date();
      const formattedDate = formatDate(date);
      setCurrentDate(formattedDate);
    };

    fetchSpecialistInfo();
    setCurrentDateFormatted();
  }, []);
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container3, {top: 50, marginBottom: 20}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, {marginTop: 20}]}>Welcome, {specialistInfo.firstName}!</Text>
      </View>
    </ScrollView>
  );
};

export default SpecialistHome;