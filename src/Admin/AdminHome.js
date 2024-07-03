import React, { useEffect, useState, useCallback} from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { useFocusEffect } from '@react-navigation/native';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const AdminHome = ({navigation}) => {
  const [currentDate, setCurrentDate] = useState(null);
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
    const setCurrentDateFormatted = () => {
      const date = new Date();
      const formattedDate = formatDate(date);
      setCurrentDate(formattedDate);
    };

    fetchAdminInfo();
    setCurrentDateFormatted();
  }, [fetchAdminInfo]);

  useFocusEffect(
    useCallback(() => {
      fetchAdminInfo();
    }, [fetchAdminInfo])
  );
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.container4, { ...Platform.select({ web: {}, default: { marginTop: 50 } }) }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, {marginTop: 10}]}>Welcome, {adminInfo.firstName}!</Text>
      </View>
    </ScrollView>
  );
};

export default AdminHome;