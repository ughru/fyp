import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Image, Platform, TouchableOpacity, StyleSheet, Dimensions, TouchableHighlight, Alert, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import { storage } from '../../firebaseConfig';
import { AntDesign, Entypo, Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import url from '../components/config';
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window');

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
      window.confirm(`${title}\n${message}`);
  } else {
      Alert.alert(title, message);
  }
};

const UserAppointments = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState('');
  const [imageUrl, setImageUrls] = useState(null);
  const [image, setImageUrl] = useState(null);
  const [activeButton, setActiveButton] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [specialistDetails, setSpecialistDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [specialistAds, setSpecialistAds] = useState([]);
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch appointments based on userEmail
      const response = await axios.get(`${url}/bookedAppt`, { params: { userEmail } });
  
      // Initialize categorized appointments
      const categorizedAppointments = {Upcoming: [], Completed: [], Cancelled: []};
  
      // Process appointments
      response.data.forEach(appointment => {
        appointment.details.forEach(detail => {
          if (categorizedAppointments[detail.status]) {
            categorizedAppointments[detail.status].push({
              ...appointment,
              details: [detail] // Include only the matching detail
            });
          }
        });
      });
  
      // Set state based on selected category
      setAppointments(sortAppointments(categorizedAppointments[activeButton]));
  
      // Fetch specialist information
      const specialistEmails = [...new Set(response.data.map(app => app.specialistEmail))];
      const responses = await Promise.all(
        specialistEmails.map(email =>
          axios.get(`${url}/specialistinfo`, { params: { email } })
        )
      );
  
      // Map specialist details
      const detailsMap = {};
      responses.forEach(response => {
        const specialistInfo = response.data;
        detailsMap[specialistInfo.email] = specialistInfo;
      });
  
      setSpecialistDetails(detailsMap);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false); 
    }
  }, [userEmail, activeButton]);  

  useEffect(() => {
    const fetchUserEmail = async () => {
      setLoading(true);
      try {
        const storedEmail = await AsyncStorage.getItem('user');
        if (storedEmail) {
          setUserEmail(storedEmail);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      } finally {
        setLoading(false); 
      }
    };

    const fetchImage = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}/allSpecialistAds`);
        if (response.data.status === 'ok') {
          const images = response.data.specialistAds.map(ad => ad.imageUrl);
          setImageUrls(images);
          setSpecialistAds(response.data.specialistAds);
        } else {
          console.error('Error fetching images:', response.data.error);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false); 
      }
    };

    const fetchErrorImage = async () => {
      setLoading(true);
      try {
        const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      } finally {
        setLoading(false); 
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

  const sortAppointments = (appointments) => {
    // Sort details within each appointment by date and time
    const sortedAppointments = appointments.map(appointment => ({
      ...appointment,
      details: appointment.details.sort((a, b) => 
        moment(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm').diff(moment(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm'))
      )
    }));
    
    // Sort appointments by the earliest date and time in details
    const sortedAppointmentsByDateAndTime = sortedAppointments.sort((a, b) => {
      // Use the earliest date and time from the details of each appointment
      const dateTimeA = moment(`${a.details[0].date} ${a.details[0].time}`, 'YYYY-MM-DD HH:mm');
      const dateTimeB = moment(`${b.details[0].date} ${b.details[0].time}`, 'YYYY-MM-DD HH:mm');
      return dateTimeA.diff(dateTimeB);
    });
    
    return sortedAppointmentsByDateAndTime;
  };  
  
  const handleMoreIconClick = (appointmentDetail) => {
    // Find the specialist email based on selected appointment
    const appointmentWithUser = appointments.find(appointment =>
      appointment.details.some(detail =>
        detail.date === appointmentDetail.date && detail.time === appointmentDetail.time
      )
    );
  
    if (appointmentWithUser) {
      // Set selected appointment with userEmail
      setSelectedAppointment({
        ...appointmentDetail,
        specialistEmail: appointmentWithUser.specialistEmail
      });
    }
  
    setModalVisible(true);
  };

  const openViewModal = () => {
    setViewModalVisible(true);
    setModalVisible(false);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
  };

  const handleCancelAppointment = async () => {
    try {
      if (selectedAppointment) {
        // Find the specialist email based on selected appointment
        const appointmentWithSpecialist = appointments.find(appointment =>
          appointment.details.some(detail => 
            detail.date === selectedAppointment.date && detail.time === selectedAppointment.time
          )
        );
  
        const specialistEmail = appointmentWithSpecialist.specialistEmail;
        const appointmentMonthYear = moment(selectedAppointment.date).format('MMMM YYYY');
    
        const response = await axios.post(`${url}/cancelAppointment`, {
          userEmail,
          specialistEmail, 
          dateMonthYear: appointmentMonthYear,
          date: selectedAppointment.date,
          time: selectedAppointment.time,
          status: 'Cancelled'
        });
  
        if (response.status === 200) {
          showAlert('Success', 'Appointment cancelled successfully.');
    
          // Update state to reflect cancellation
          setAppointments(prevAppointments =>
            prevAppointments.map(appointment => ({
              ...appointment,
              details: appointment.details.map(detail =>
                detail.date === selectedAppointment.date && detail.time === selectedAppointment.time
                  ? { ...detail, status: 'Cancelled' }
                  : detail
              )
            }))
          );
          setModalVisible(false);
          fetchAppointments();
        } else {
          showAlert('Error','Failed to cancel appointment.');
        }
      }
    } catch (error) {
      showAlert('Error', 'An error occurred while cancelling the appointment.');
    }
  };  
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.container4, Platform.OS !== 'web' && { paddingTop: 50 }]}>
        <Text style={[styles.pageTitle]}> Appointments</Text>

        <View style={[styles.adImageContainer, {
          ...Platform.select({
          web:{width:screenWidth*0.9, paddingTop:20, left: 20, paddingRight:10},
          default:{paddingTop:20, left: 20, paddingRight:10}
        }) }]}>
        {specialistAds.length > 0 && (
          <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20}}>
            {specialistAds.map((ad, index) => (
              <View key={index} style= {{marginBottom: 20}}>
              <TouchableOpacity style={{ width: 300, height: 200, marginBottom: 10 }}>
                {/* Image */}
                <View style={{ ...StyleSheet.absoluteFillObject }}>
                  <Image source={{ uri: ad.imageUrl  }}
                    style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'contain' }}/>
                </View>
              </TouchableOpacity>
              <Text style= {[styles.text, {alignSelf: 'center'}]}> {ad.title} by {ad.company}</Text>
              </View>
            ))}
          </ScrollView>
        )}
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

        {loading ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Text>Loading posts...</Text>
          <ActivityIndicator size="large" color="#E3C2D7" />
        </View>
        ) : appointments.length === 0 ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
          {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
          <Text style={[styles.formText, { fontStyle: 'italic' }]}>Oops! Nothing here yet</Text>
        </View>
        ) : (
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          {appointments.map((appointment, index) => (
            <View key={index} style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
              {appointment.details.map((detail, detailIndex) => (
                <View key={detailIndex} style={{ width: '90%', marginTop: 10, borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 15 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10 }}>
                    {specialistDetails[appointment.specialistEmail] && (
                      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                        <Text style={[styles.text3, { marginBottom: 10 }]}>
                          Dr. {specialistDetails[appointment.specialistEmail]?.firstName} {specialistDetails[appointment.specialistEmail]?.lastName}
                        </Text>
                        <Text style={[styles.text3, { marginBottom: 10, marginLeft: 5 }]}>
                          • {specialistDetails[appointment.specialistEmail]?.specialisation}
                        </Text>
                        <TouchableHighlight
                          style={[styles.iconContainer, { marginBottom: 10, marginLeft: 'auto' }]}
                          underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}
                          onPress={() => handleMoreIconClick(detail)}
                        >
                          <Entypo name="dots-three-vertical" size={16} />
                        </TouchableHighlight>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.text, { marginBottom: 10 }]}>{formatDate(detail.date)}, </Text>
                    <Text style={[styles.text, { marginBottom: 10 }]}>{detail.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
        )}
      </View>

      {/* Modal for view/cancel */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
        <View style={{ width: '90%', backgroundColor: '#E3C2D7', borderRadius: 10, padding: 20 }}>
          <Pressable style={{ marginLeft: 'auto' }}>
            <Feather name="x" size={24} color="black" onPress={() => setModalVisible(false)} />
          </Pressable>
          {/* Selections */}
          {selectedAppointment && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Ionicons name="eye-outline" size={24} color="black" />
                <Pressable style={{ marginLeft: 10 }} onPress={openViewModal}>
                    <Text style={styles.text}> View Appointment </Text>
                </Pressable>
            </View>
            {selectedAppointment.status === 'Upcoming' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <MaterialIcons name="delete-outline" size={24} color="black" />
                <Pressable style={{ marginLeft: 10 }} onPress={handleCancelAppointment}>
                  <Text style={styles.text}>Cancel Appointment</Text>
                </Pressable>
              </View>
            )}
            </View>
          )}
        </View>
        </View>
      </Modal>

      {/* Modal for viewing appointment details */}
      <Modal animationType="fade" transparent={true} visible={viewModalVisible} onRequestClose={closeViewModal}>
        <View style={[styles.modalOverlay]}>
          <View style={{ width: '90%', backgroundColor: '#E3C2D7', borderRadius: 10, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <Text style={[styles.questionText, {marginBottom: 20}]}>Appointment Details</Text>
              <Pressable style={{ marginLeft: 'auto', marginBottom: 20 }}>
                <Feather name="x" size={24} color="black" onPress={closeViewModal} />
              </Pressable>
            </View>
            {selectedAppointment && (
              <View>
                <Text style={[styles.text, { marginBottom: 10 }]}>
                  Specialist Name: {specialistDetails[selectedAppointment?.specialistEmail]?.firstName} {specialistDetails[selectedAppointment?.specialistEmail]?.lastName}
                </Text>
                <Text style={[styles.text, {marginBottom: 10}]}>Date: {formatDate(selectedAppointment.date)}</Text>
                <Text style={[styles.text, {marginBottom: 10}]}>Time: {selectedAppointment.time}</Text>
                {['Upcoming'].includes(selectedAppointment.status) && (
                <Text style={[styles.text, { marginBottom: 10 }]}>Contact: {specialistDetails[selectedAppointment?.specialistEmail]?.contact}</Text>
                )}
                {['Completed'].includes(selectedAppointment.status) && (
                  <Text style={[styles.text, { marginBottom: 10 }]}>
                    Specialist Notes: {selectedAppointment.specialistNotes || 'N.A.'}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

export default UserAppointments;