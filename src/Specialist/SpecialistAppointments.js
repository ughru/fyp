import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, TextInput, Image, Platform, TouchableOpacity, TouchableHighlight, Modal, Alert } from 'react-native';
import styles from '../components/styles';
import { storage } from '../../firebaseConfig';
import { AntDesign, MaterialCommunityIcons, MaterialIcons, Entypo, Ionicons, Feather} from '@expo/vector-icons';
import axios from 'axios';
import url from '../components/config';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SpecialistAppointments = ({navigation}) => {
  const [userEmail, setUserEmail] = useState('');
  const [image, setImageUrl] = useState(null);
  const [activeButton, setActiveButton] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [inputHeight, setInputHeight] = useState(30);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      // For web platform
      window.alert(`${title}\n${message}`);
    } else {
      // For mobile platforms
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  };
  
  const fetchAppointments = useCallback(async () => {
    try {
      if (!userEmail) return; // Early return if userEmail is not set
  
      const response = await axios.get(`${url}/bookedAppt2`, { params: { specialistEmail: userEmail } });
  
      // Initialize categorized appointments
      const categorizedAppointments = { Upcoming: [], Completed: [], Cancelled: [] };
  
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
  
      // Fetch user details
      const userEmails = [...new Set(response.data.map(app => app.userEmail))];
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

  const sortAppointments = (appointments) => {
    // Sort appointments by their date (Month YYYY)
    const sortedAppointmentsByMonth = appointments.sort((a, b) => 
      moment(a.date, 'MMMM YYYY').diff(moment(b.date, 'MMMM YYYY'))
    );
  
    // Sort details within each appointment by date (YYYY-MM-DD)
    const sortedAppointments = sortedAppointmentsByMonth.map(appointment => ({
      ...appointment,
      details: appointment.details.sort((a, b) => 
        moment(a.date, 'YYYY-MM-DD').diff(moment(b.date, 'YYYY-MM-DD'))
      )
    }));
  
    return sortedAppointments;
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
        userEmail: appointmentWithUser.userEmail 
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

  const openUpdateModal = () => {
    setUpdateModalVisible(true);
    setModalVisible(false);  
    setNoteInput('');
  };

  const closeUpdateModal = () => {
    setUpdateModalVisible(false);
  };

  const handleNoteSubmit = async () => {
    try {
      if (selectedAppointment) {
        // Find the specialist email based on selected appointment
        const appointmentWithUser = appointments.find(appointment =>
          appointment.details.some(detail => 
            detail.date === selectedAppointment.date && detail.time === selectedAppointment.time
          )
        );
  
        const user = appointmentWithUser.userEmail;
        const appointmentMonthYear = moment(selectedAppointment.date).format('MMMM YYYY');
  
        const response = await axios.post(`${url}/updateAppointment`, {
          userEmail: user,
          specialistEmail: userEmail,
          dateMonthYear: appointmentMonthYear,
          date: selectedAppointment.date,
          time: selectedAppointment.time,
          status: 'Completed',
          note: noteInput
        });
  
        if (response.status === 200) {
          showAlert('Success', 'Appointment updated successfully.');
          setUpdateModalVisible(false);
  
          // Update state to reflect cancellation
          setAppointments(prevAppointments =>
            prevAppointments.map(appointment => ({
              ...appointment,
              details: appointment.details.map(detail =>
                detail.date === selectedAppointment.date && detail.time === selectedAppointment.time
                  ? { ...detail, status: 'Completed', specialistNotes: noteInput }
                  : detail
              )
            }))
          );

          fetchAppointments();
        } else {
          showAlert('Error', 'Failed to update appointment.');
        }
      }
    } catch (error) {
      showAlert('Error', 'An error occurred while updating the appointment.');
    }
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
        <MaterialIcons name="local-offer" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate("SpecialistAdvertisements")}>
            <Text style={styles.questionText}>Offered Services</Text>
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
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          {appointments.map((appointment, index) => (
            <View key={index} style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
              {appointment.details.map((detail, detailIndex) => (
                <View key={detailIndex} style={{ width: '90%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 15, marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10 }}>
                    {userDetails[appointment.userEmail] && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={[styles.text3, { flex: 1, marginBottom: 10 }]}>
                          {userDetails[appointment.userEmail]?.firstName} {userDetails[appointment.userEmail]?.lastName}
                        </Text>
                        <TouchableHighlight
                          style={[styles.iconContainer, {marginBottom: 10}]}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Feather name="edit" size={22} color="black" />
                    <Pressable style={{ marginLeft: 10 }} onPress={openUpdateModal}>
                        <Text style={styles.text}>Update Appointment</Text>
                    </Pressable>
                </View>
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
                <Text style={[styles.text, {marginBottom: 10}]}>Date: {formatDate(selectedAppointment.date)}</Text>
                <Text style={[styles.text, {marginBottom: 10}]}>Time: {selectedAppointment.time}</Text>
                {['Upcoming'].includes(selectedAppointment.status) && (
                <Text style={[styles.text, { marginBottom: 10 }]}>Contact: {userDetails[selectedAppointment.userEmail]?.contact}</Text>
                )}
                <Text style={[styles.text, {marginBottom: 10}]}>User Comments: {selectedAppointment.userComments || 'N.A.'}</Text>
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

       {/* Modal for updating appointment */}
      <Modal animationType="fade" transparent={true} visible={updateModalVisible} onRequestClose={closeUpdateModal}>
        <View style={[styles.modalOverlay]}>
          <View style={{ width: '90%', backgroundColor: '#E3C2D7', borderRadius: 10, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
              <Text style={[styles.questionText, { marginBottom: 20 }]}>Update Appointment</Text>
              <Pressable style={{ marginLeft: 'auto', marginBottom: 20 }}>
                <Feather name="x" size={24} color="black" onPress={closeUpdateModal} />
              </Pressable>
            </View>
            {selectedAppointment && (
              <ScrollView>
                <Text style= {[styles.text, {marginBottom: 10}]}> Specialist Notes: </Text>
                <TextInput
                  style={[styles.input2, { width: 300, height: inputHeight, maxHeight: 200, marginBottom: 20 }]}
                  placeholder="Enter notes..."
                  placeholderTextColor='black'
                  value={noteInput}
                  onChangeText={setNoteInput}
                  multiline
                  onContentSizeChange={e => setInputHeight(e.nativeEvent.contentSize.height)}/>
                <TouchableOpacity style={[styles.button, {borderWidth: 1, borderColor: 'black'}]} onPress={handleNoteSubmit}>
                  <Text style={styles.text}>Submit</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

export default SpecialistAppointments;