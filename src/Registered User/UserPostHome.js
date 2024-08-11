import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Platform, StyleSheet, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { useFocusEffect } from '@react-navigation/native';

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
  const scrollRef = useRef(null);

  const fetchUserInfo = useCallback(async () => {
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
  }, []);

  const fetchPersonalisationAndResources = useCallback(async () => {
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
    }
  }, [userInfo.status]);

  const dietRecos = useCallback(async () => {
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
  }, [fetchUserInfo, fetchPersonalisationAndResources, dietRecos]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchPersonalisationAndResources();
      if (personalisation && personalisation.q4 && personalisation.q4.includes('Diet Recommendations')) {
      dietRecos();
    } else {
      setDietReco([]);
    }
    }, [fetchUserInfo, fetchPersonalisationAndResources, dietRecos])
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
          <View style={[{width: 320, height: 40, padding: 5, borderRadius: 20, backgroundColor: '#E3C2D7'}]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style = {[{marginLeft: 20, marginRight: 20}]}>
                <Feather name="calendar" size={24} color="black" />
              </View>
              <Text style={[styles.text, {fontStyle: 'italic'}]}>No Appointments Yet</Text>
            </View>
          </View>

        <View style={[styles.container3, { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 40 }]}>
          <Ionicons name="scale-outline" size={24} color="black" style={{ marginRight: 10 }} />
          <Pressable onPress={() => navigation.navigate("WeightTracker")}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>
      </View>

      {dietReco.length > 0 && (
      <View style = {[styles.container4]}>
      <Text style={[styles.titleNote, { marginBottom: 20 }]}>Diet Recommendations For You</Text>
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
      </View>
      )}

      {/* Dynamically get 10 recommended resources */}
      <View style = {[styles.container4]}>
        <Text style={[styles.titleNote, { marginBottom: 20 }]}>Suggested for you</Text>
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
      </View>

      <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => navigation.navigate("Resources")}>
        <Text style={styles.text}>See more</Text>
      </Pressable>
    </ScrollView>
  );
};

export default UserPostHome;
