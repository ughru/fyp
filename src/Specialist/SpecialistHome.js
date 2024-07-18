import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Image } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { storage } from '../../firebaseConfig';
import moment from 'moment';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const SpecialistHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [specialistInfo, setSpecialistInfo] = useState([]);
  const [image, setImageUrl] = useState(null); // 404 not found display
  const [appointments, setAppointments] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

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

  const fetchAppointments = useCallback(async () => {
    try {
      if (specialistInfo.email) {
        const response = await axios.get(`${url}/bookedAppt2`, { params: { specialistEmail: specialistInfo.email } });
        const filteredAppointments = response.data.filter(appointment => appointment.details.some(detail => detail.status === 'Upcoming'));

        const userEmails = filteredAppointments.map(appointment => appointment.userEmail);
        const responses = await Promise.all(
          userEmails.map(email =>
            axios.get(`${url}/userinfo`, { params: { email } })
          )
        );

        const detailsMap = {};
        responses.forEach(response => {
          const userInfo = response.data;
          detailsMap[userInfo.email] = userInfo;
        });

        setUserDetails(detailsMap);
        setAppointments(filteredAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [specialistInfo.email]);

  useEffect(() => {
    const setCurrentDateFormatted = () => {
      const date = new Date();
      const formattedDate = formatDate(date);
      setCurrentDate(formattedDate);
    };

    const fetchImage = async () => {
      try {
        const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
    fetchSpecialistInfo().then(fetchAppointments);
    setCurrentDateFormatted();
  }, [fetchSpecialistInfo, fetchAppointments]);

  useFocusEffect(
    useCallback(() => {
      fetchSpecialistInfo().then(fetchAppointments);
    }, [fetchSpecialistInfo, fetchAppointments])
  );

  const formatDate2 = (date) => {
    return moment(date, 'YYYY-MM-DD').format('Do MMMM YYYY');
  };
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.container4, { ...Platform.select({ web: {}, default: { marginTop: 50 } }) }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, {marginTop: 10}]}>Welcome, {specialistInfo.firstName}!</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
        <FontAwesome5 name="ad" size={24} color="black" />
        <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate("SpecialistAdvertisements")}>
          <Text style={styles.questionText}>Advertisements</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={[styles.formText, {flex:1}]}>Upcoming Appointments</Text>
        <Pressable style= {{alignItems: 'flex-end'}} onPress={() => navigation.navigate("Appointments")}>
          <Text style={styles.formText}>See All </Text>
        </Pressable>
      </View>

      {appointments.length === 0 ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
          {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
          <Text style={[styles.formText, { fontStyle: 'italic' }]}> Oops! Nothing here yet </Text>
        </View>
      ) : (
        <ScrollView>
        {appointments.map((appointment, index) => (
          <View key={index}>
            {appointment.details.map((detail, detailIndex) => (
            <View key={detailIndex} style= {{justifyContent: 'center', alignItems: 'center', marginBottom: 20}}>
              <View style={{ width: '90%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 15}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                {userDetails[appointment.userEmail] && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}>
                    <Text style={[styles.text3, {flex: 1, marginBottom: 10 }]}>
                      {userDetails[appointment.userEmail]?.firstName} {userDetails[appointment.userEmail]?.lastName}
                    </Text>
                  </View>
                )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                  <Text style= {[styles.text, {marginBottom: 10}]}>{formatDate2(detail.date)}, </Text>
                  <Text style= {[styles.text, {marginBottom: 10}]}>{detail.time}</Text>
                </View>
              </View>
            </View>
            ))}
          </View>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
};

export default SpecialistHome;