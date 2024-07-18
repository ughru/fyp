import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, TextInput, Image, Platform, TouchableOpacity, TouchableHighlight } from 'react-native';
import styles from '../components/styles';
import { storage } from '../../firebaseConfig';
import { AntDesign, MaterialCommunityIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import url from '../components/config';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SpecialistAppointments = ({navigation}) => {
  const [userEmail, setUserEmail] = useState('');
  const [imageUrl, setImageUrls] = useState(null);
  const [image, setImageUrl] = useState(null);
  const [activeButton, setActiveButton] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/bookedAppt2`, { params: { specialistEmail: userEmail } });
      const filteredAppointments = response.data.filter(appointment => appointment.details.some(detail => detail.status === activeButton));

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
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [userEmail, activeButton]);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user');
        if (storedEmail) {
          setUserEmail(storedEmail);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    const fetchImage = async () => {
      try {
       const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchUserEmail();
    fetchImage();
    fetchAppointments();
  }, [fetchAppointments]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments(); 
    }, [fetchAppointments])
  );

  const handleCategoryButtonClick = (category) => {
    setActiveButton(category);
  };
 
  const formatDate = (date) => {
    return moment(date, 'YYYY-MM-DD').format('Do MMMM YYYY');
  };

  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container4 , Platform.OS!=="web"&&{paddingTop:50}]}>
        <Text style={[styles.pageTitle]}> Appointments</Text>
      </View>

      <View style={[styles.container4, { marginBottom: 20}]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
          <AntDesign name="calendar" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate('CreateAppointments')}>
            <Text style={styles.questionText}>Create Appointment</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <MaterialCommunityIcons name="timetable" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }}  onPress={() => navigation.navigate('ViewSchedule')}>
            <Text style={styles.questionText}>View Schedule</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <FontAwesome5 name="ad" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate("SpecialistAdvertisements")}>
            <Text style={styles.questionText}>Advertisements</Text>
          </Pressable>
        </View>

        <Text style={[styles.questionText, {marginBottom: 20}]}>Overview</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: 10 }}>
          <TouchableOpacity
            onPress={() => handleCategoryButtonClick('Upcoming')}
            style={activeButton === 'Upcoming' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCategoryButtonClick("Completed")}
            style={activeButton === 'Completed' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCategoryButtonClick("Cancelled")}
            style={activeButton === 'Cancelled' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>Cancelled</Text>
          </TouchableOpacity>
        </View>
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
                    <TouchableHighlight
                      style={[styles.iconContainer, { marginBottom: 10 }]}
                      underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}
                    >
                      <Entypo name="dots-three-vertical" size={16} />
                    </TouchableHighlight>
                  </View>
                )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                  <Text style= {[styles.text, {marginBottom: 10}]}>{formatDate(detail.date)}, </Text>
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

export default SpecialistAppointments;