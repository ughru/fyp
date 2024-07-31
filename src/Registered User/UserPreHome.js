import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Platform, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { useFocusEffect } from '@react-navigation/native';
import Calendar from '../components/Calendar';

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

const UserPreHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [resources, setResources] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
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
    }
  }, []);

  const fetchPersonalisation = useCallback(async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('user');
      if (storedEmail) {
        const response = await axios.get(`${url}/getPersonalisation?userEmail=${storedEmail}`);
        if (response.data) {
          setPersonalisation(response.data.personalisation);
        }
      }
    } catch (error) {
    }
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Fetch all resources
        const response = await axios.get(`${url}/resource`);
        let resources = response.data.resources;
        resources = resources.filter(resource => resource.category !== 'Pregnancy Summary' && resource.category !== 'Diet Recommendations' && resource.status.includes(userInfo.status));

        // Filter resources based on personalisation data
        if (personalisation.length > 0) {
          // Convert personalisation array to a key-value map
          const parsedPersonalisation = personalisation.reduce((acc, item) => {
            const [key, value] = item.split(': ');
            if (value) acc[key] = value;
            return acc;
          }, {});

          // Check if q2 exists and is a string of comma-separated categories
          if (typeof parsedPersonalisation.q2 === 'string') {
            // Convert the comma-separated string into an array
            const selectedCategories = parsedPersonalisation.q2.split(',').map(cat => cat.trim());
            resources = resources.filter(resource => selectedCategories.includes(resource.category));
          }
        }

        // Shuffle and select 10 random resources
        if (resources > 10) {
          resources = shuffleArray(resources).slice(0, 10);
        } else {
          resources = resources;
        }

        setResources(resources);
      } catch (error) {
        setResources([]);
      }
    };

    fetchUserInfo();
    fetchPersonalisation();
    fetchResources();
    setCurrentDate(formatDate(new Date()));
  }, [fetchUserInfo, fetchPersonalisation, userInfo.status, personalisation]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchPersonalisation();
    }, [fetchUserInfo, fetchPersonalisation])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
     <View style={[styles.container4, { ...Platform.select({ web: {}, default: { paddingTop: 50 } }) }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <Text style={[styles.textTitle, {paddingTop: 10}]}>Welcome, {userInfo.firstName}!</Text>
      </View>

      <View style={[styles.container4]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable style={styles.button7} />
          <Text style={[styles.text, { marginLeft: 10 }]}>Today</Text>
          <Pressable style={[styles.button8, { marginLeft: 30 }]} />
          <Text style={[styles.text, { marginLeft: 10 }]}>Ovulation</Text>
        </View>

        <View>
          <Calendar/>
        </View>

        <Pressable style={[styles.button, { alignSelf: 'center', marginTop: 20, marginBottom: 20 }]} onPress={() => navigation.navigate("LogPeriod")}>
          <Text style={styles.text}>Log Period</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <MaterialIcons name="history" size={24} color="black" />
          <Pressable onPress={() => navigation.navigate("CycleHistory")} style={{ marginLeft: 10 }}>
            <Text style={styles.questionText}>Cycle History</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="scale-outline" size={24} color="black" />
          <Pressable onPress={() => navigation.navigate("WeightTracker")} style={{ marginLeft: 10 }}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>

        <Text style={[styles.titleNote, { marginBottom: 20 }]}>Suggested for you</Text>
      </View>

      <View>
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

export default UserPreHome;