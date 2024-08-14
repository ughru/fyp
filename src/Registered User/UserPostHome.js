import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Platform, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const UserPostHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [resources, setResources] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [dietReco, setDietReco] = useState([]);
  const [personalisation, setPersonalisation] = useState(null);
  const [specialistDetails, setSpecialistDetails] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false); 
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      if (userInfo.email) {
        // Fetch appointments from the API
        const response = await axios.get(`${url}/bookedAppt`, { params: { userEmail: userInfo.email } });
  
        // Initialize categorized appointments
        const categorizedAppointments = { Upcoming: [], Completed: [], Cancelled: [] };
  
        // Get today's date for comparison
        const today = new Date();
  
        response.data.forEach(appointment => {
          // Sort the details by date closest to today's date
          const sortedDetails = appointment.details.sort((a, b) => {
            return Math.abs(new Date(a.date) - today) - Math.abs(new Date(b.date) - today);
          });
  
          // Get the closest date details
          const closestDate = sortedDetails[0].date;
          const closestDetails = sortedDetails.filter(detail => detail.date === closestDate);
  
          // Push all details with the closest date to the categorized appointments
          closestDetails.forEach(detail => {
            if (categorizedAppointments[detail.status]) {
              categorizedAppointments[detail.status].push({
                ...appointment,
                details: [detail] // Include only the matching detail
              });
            }
          });
        });
  
        // Set state to only 'Upcoming' appointments
        setAppointments(sortAppointments(categorizedAppointments['Upcoming']));
  
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
  
        // Set specialist details state
        setSpecialistDetails(detailsMap);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false); 
    }
  }, [userInfo.email]);
  
  const formatDate2 = (date) => {
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

  const fetchPersonalisationAndResources = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user email
      const storedEmail = await AsyncStorage.getItem('user');
      if (!storedEmail) return; // Exit if no email is found
  
      // Fetch personalisation data
      const personalisationResponse = await axios.get(`${url}/getPersonalisation?userEmail=${storedEmail}`);
      const personalisationData = personalisationResponse.data.personalisation || [];
  
      // Parse personalisation data
      const parsedSelections = personalisationData.reduce((acc, item) => {
        const [key, value] = item.split(': ');
        if (value) acc[key] = value;
        return acc;
      }, {});
      
      // Set personalisation data
      setPersonalisation(parsedSelections);
  
      // Fetch resources
      const resourceResponse = await axios.get(`${url}/resource`);
      let resources = resourceResponse.data.resources;
  
      // Filter resources based on user status
      resources = resources.filter(resource => 
        resource.category !== 'Pregnancy Summary' && 
        resource.category !== 'Diet Recommendations' && 
        resource.status.includes(userInfo.status)
      );
  
      // Apply filtering based on personalisation data
      if (personalisationData.length > 0) {
        // Check if q4 exists and is a string of comma-separated categories
        if (typeof parsedSelections.q4 === 'string') {
          const selectedCategories = parsedSelections.q4.split(',').map(cat => cat.trim());
          resources = resources.filter(resource => selectedCategories.includes(resource.category));
        }
      }
  
      // Shuffle and select 10 random resources
      if (resources.length > 10) {
        resources = shuffleArray(resources).slice(0, 10);
      }
  
      // Set resources state
      setResources(resources);
      
    } catch (error) {
      console.error('Error fetching personalisation or resources:', error);
      const resourceResponse = await axios.get(`${url}/resource`);
      let resources = resourceResponse.data.resources;
      resources = resourceResponse.data.resources.filter(resource =>
        resource.category !== 'Pregnancy Summary' &&
        resource.category !== 'Diet Recommendations' &&
        resource.status.includes(userInfo.status)
      );
  
      // Shuffle and select 10 random resources
      if (resources.length > 10) {
        resources = shuffleArray(resources).slice(0, 10);
      }
  
      // Set resources state
      setResources(resources);
    } finally {
      setLoading(false); 
    }
  }, [userInfo.status]);

  const dietRecos = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch the user email
      const storedEmail = await AsyncStorage.getItem('user');
      if (!storedEmail) return;
  
      // Fetch all resources
      const { data: { resources } } = await axios.get(`${url}/resource`);
      const dietResources = resources.filter(resource => resource.category === 'Diet Recommendations');
  
      // Fetch weight logs
      const { data: weightLogs } = await axios.get(`${url}/allWeightLogs`, { params: { userEmail: storedEmail } });
  
      let filteredResources = [];
  
      if (weightLogs && weightLogs.length > 0) {
        // Process weight logs if they exist
        weightLogs.forEach(log => {
          if (log.record && log.record.length > 0) {
            const specificCategory = log.record[log.record.length - 1].category;
            const bmiMap = {
              'Underweight': 'Underweight',
              'Normal Weight': 'Normal',
              'Overweight': 'Overweight',
              'Obese': 'Obese'
            };
            const bmi = bmiMap[specificCategory] || '';
  
            // Filter diet resources based on BMI
            const filtered = dietResources.filter(resource => resource.bmi.includes(bmi));
            filteredResources = [...filteredResources, ...filtered];
          }
        });
      }
  
      // Shuffle and select 10 random resources
      const randomResources = shuffleArray(filteredResources).slice(0, 10);
      setDietReco(randomResources);
    } catch (error) {
      // Fetch all resources
      const { data: { resources } } = await axios.get(`${url}/resource`);
      const dietResources = resources.filter(resource => resource.category === 'Diet Recommendations');
      let filteredResources = [];
      filteredResources = dietResources;

      // Shuffle and select 10 random resources
      const randomResources = shuffleArray(filteredResources).slice(0, 10);
      setDietReco(randomResources);
    } finally {
      setLoading(false); 
    }
  }, []);  

  useEffect(() => {
    fetchUserInfo();
    fetchPersonalisationAndResources();
    if (personalisation && personalisation.q4 && personalisation.q4.includes('Diet Recommendations')) {
      dietRecos();
    } else {
      setDietReco([]);
    }
    setCurrentDate(formatDate(new Date()));
    fetchAppointments();
  }, [fetchUserInfo, fetchPersonalisationAndResources, dietRecos, fetchAppointments]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchPersonalisationAndResources();
      fetchAppointments();
      if (personalisation && personalisation.q4 && personalisation.q4.includes('Diet Recommendations')) {
      dietRecos();
    } else {
      setDietReco([]);
    }
    }, [fetchUserInfo, fetchPersonalisationAndResources, dietRecos, fetchAppointments])
  );

  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[styles.container4, { ...Platform.select({ web: {}, default: { marginTop: 50 } }) }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <Text style={[styles.textTitle, { marginTop: 10, marginBottom: 30 }]}>Welcome, {userInfo.firstName}!</Text>
      </View>

      <View style={[styles.container4, { marginBottom: 20 }]}>
        <Text style={[styles.text, { marginBottom: 20 }]}>Upcoming Appointments</Text>
        {loading ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Text>Loading posts...</Text>
          <ActivityIndicator size="large" color="#E3C2D7" />
        </View>
      ) : appointments.length === 0 ? (
          <View style={[{width: 320, height: 40, padding: 5, borderRadius: 20, backgroundColor: '#E3C2D7', marginBottom: 20}]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style = {[{marginLeft: 20, marginRight: 20}]}>
                <Feather name="calendar" size={24} color="black" />
              </View>
              <Text style={[styles.text, {fontStyle: 'italic'}]}>No Appointments Yet</Text>
            </View>
          </View>
        ) : (
        <ScrollView>
        {appointments.map((appointment, index) => (
          <View key={index}>
            {appointment.details.map((detail, detailIndex) => (
            <View key={detailIndex} style= {{justifyContent: 'center', alignItems: 'center', marginBottom: 20}}>
              <View style={{ width: '90%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 15}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                {specialistDetails[appointment.specialistEmail] && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}>
                    <Text style={[styles.text3, {flex: 1, marginBottom: 10 }]}>
                      {specialistDetails[appointment.specialistEmail]?.firstName} {specialistDetails[appointment.specialistEmail]?.lastName}
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

        <View style={[styles.container3, { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }]}>
          <Ionicons name="scale-outline" size={24} color="black" style={{ marginRight: 10 }} />
          <Pressable onPress={() => navigation.navigate("WeightTracker")}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>
      </View>

      {dietReco.length > 0 && (
      <View style = {[styles.container4]}>
      <Text style={[styles.titleNote, { marginBottom: 20 }]}>Diet Recommendations For You</Text>
        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Text>Loading posts...</Text>
            <ActivityIndicator size="large" color="#E3C2D7" />
          </View>
        ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingVertical: 10 }}>
          {dietReco.map((reco, index) => (
            <View key={index} style={{ marginBottom: 20 }}>
              <TouchableOpacity style={styles.resourceBtn}   onPress={() => navigation.navigate('UserResourceInfo', { resourceID: reco.resourceID })}>
                <View style={{ ...StyleSheet.absoluteFillObject }}>
                  <Image
                    source={{ uri: reco.imageUrl }}
                    style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' }}
                  />
                </View>
              </TouchableOpacity>
              <Text style={[styles.text, { marginTop: 5, width: 100, textAlign: 'flex-start' }]}>
                {reco.title}
              </Text>
            </View>
          ))}
        </ScrollView>
        )}
      </View>
      )}

      {/* Dynamically get 10 recommended resources */}
      <View style = {[styles.container4]}>
        <Text style={[styles.titleNote, { marginBottom: 20 }]}>Suggested for you</Text>
        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Text>Loading posts...</Text>
            <ActivityIndicator size="large" color="#E3C2D7" />
          </View>
        ) : (
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingVertical: 10 }}>
          {resources.map(
            (resource, index) => (
              <View key={index} style= {{marginBottom: 20}}>
              <TouchableOpacity
                key={index}
                style={styles.resourceBtn}
                onPress={() => navigation.navigate('UserResourceInfo', { resourceID: resource.resourceID })}
              >
                {/* Image */}
                <View style={{ ...StyleSheet.absoluteFillObject }}>
                  <Image
                    source={{ uri: resource.imageUrl}}
                    style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' }}
                  />
                </View>
              </TouchableOpacity>
              <Text style= {[styles.text, {marginTop: 5, width: 100, textAlign: 'flex-start'}]}>
                {resource.title} 
              </Text>
              </View>
            )
          )}
        </ScrollView>
        )}
      </View>

      <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => navigation.navigate("Resources")}>
        <Text style={styles.text}>See more</Text>
      </Pressable>
    </ScrollView>
  );
};

export default UserPostHome;
