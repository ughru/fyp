import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Image, Platform, TouchableOpacity, StyleSheet, Dimensions, TouchableHighlight } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import { storage } from '../../firebaseConfig';
import { AntDesign, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import url from '../components/config';
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window');

const UserAppointments = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState('');
  const [imageUrl, setImageUrls] = useState(null);
  const [image, setImageUrl] = useState(null);
  const [activeButton, setActiveButton] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [specialistDetails, setSpecialistDetails] = useState([]);
  const scrollRef = useRef(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/bookedAppt`, { params: { userEmail } });
      const filteredAppointments = response.data.filter(appointment => appointment.details.some(detail => detail.status === activeButton));
      
      const specialistEmails = filteredAppointments.map(appointment => appointment.specialistEmail);
      const responses = await Promise.all(
        specialistEmails.map(email =>
          axios.get(`${url}/specialistinfo`, { params: { email } })
        )
      );

      const detailsMap = {};
      responses.forEach(response => {
        const specialistInfo = response.data;
        detailsMap[specialistInfo.email] = specialistInfo;
      });

      setSpecialistDetails(detailsMap);
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
        const storageRef = storage.ref('specialistAd');
        const images = await storageRef.listAll();

        const randomImages = [];
        const totalImages = Math.min(images.items.length, 5);

        const randomIndices = new Set();
        while (randomIndices.size < totalImages) {
          randomIndices.add(Math.floor(Math.random() * images.items.length));
        }

        for (let index of randomIndices) {
          const imageUrl = await images.items[index].getDownloadURL();
          randomImages.push(imageUrl);
        }

        setImageUrls(randomImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    const fetchErrorImage = async () => {
      try {
        const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchUserEmail();
    fetchImage();
    fetchErrorImage();
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.container4, Platform.OS !== 'web' && { paddingTop: 50 }]}>
        <Text style={[styles.pageTitle]}> Appointments</Text>

        <View style={[styles.adImageContainer, {
          ...Platform.select({
            web: { width: screenWidth * 0.9, paddingTop: 20, left: 20, paddingRight: 10 },
            default: { paddingTop: 20, paddingRight: 10 }
          })
        }]}>
          <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
            {imageUrl && imageUrl.map((url, index) => (
              <TouchableOpacity key={index} style={{ width: 250, height: 200 }}>
                <View style={{ ...StyleSheet.absoluteFillObject }}>
                  <Image source={{ uri: url }} style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'contain' }} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={[styles.container4, { marginBottom: 20 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <AntDesign name="calendar" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate('UserBookAppointment')}>
            <Text style={styles.questionText}>Book Appointment</Text>
          </Pressable>
        </View>

        <Text style={[styles.questionText, { marginBottom: 20 }]}>Overview</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity onPress={() => handleCategoryButtonClick('Upcoming')} style={activeButton === 'Upcoming' ? styles.categoryBtnActive : styles.categoryBtn}>
            <Text style={styles.text}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleCategoryButtonClick('Completed')} style={activeButton === 'Completed' ? styles.categoryBtnActive : styles.categoryBtn}>
            <Text style={styles.text}>Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleCategoryButtonClick('Cancelled')} style={activeButton === 'Cancelled' ? styles.categoryBtnActive : styles.categoryBtn}>
            <Text style={styles.text}>Cancelled</Text>
          </TouchableOpacity>
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
              <View style={{ marginTop: 10, width: '90%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 15}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                {specialistDetails[appointment.specialistEmail] && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={[styles.text3, { marginBottom: 10 }]}>Dr. {specialistDetails[appointment.specialistEmail]?.firstName} {specialistDetails[appointment.specialistEmail]?.lastName}</Text>
                      <Text style={[styles.text3, { marginBottom: 10 }]}> • {specialistDetails[appointment.specialistEmail]?.specialisation}</Text>
                    </View>
                    <TouchableHighlight style={[styles.iconContainer, { marginBottom: 10 }]}
                      underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}>
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
      </View>
    </ScrollView>
  );
};

export default UserAppointments;