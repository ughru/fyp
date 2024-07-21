import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Image, Platform, StyleSheet} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { fetchResources } from '../components/manageResource';
import { firebase } from '../../firebaseConfig'; 
import { useFocusEffect } from '@react-navigation/native';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};  

const UserDuringHome = ({navigation}) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [resources, setResources] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [userInfo, setUserInfo] = useState([]);
  const scrollRef = useRef(null);
  const [q5Option, setQ5Option] = useState('');
  const [conceptionWeek, setConceptionWeek] = useState('');
  const [personalisationData, setPersonalisationData] = useState([]);
  const [selections, setSelections] = useState({});

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

  const fetchPersonalisationData = useCallback(async () => {
    if (!userInfo.email) return;
    try {
      const response = await axios.get(`${url}/getPersonalisation`, {
        params: { userEmail: userInfo.email }
      });

      setPersonalisationData(response.data);

      if (response.data.personalisation !== '') {
        const parsedSelections = JSON.parse(response.data.personalisation);
        setSelections(parsedSelections);
        
        // Check for q5 option and set it
        if (parsedSelections.q5) {
          setQ5Option(parsedSelections.q5);
          // Calculate conception week
          try {
            const dateObject = convertStringToDate(parsedSelections.q5);
            const weeks = calculateWeeksSince(dateObject);
            setConceptionWeek(weeks + 3); // Assuming this logic is correct
          } catch (error) {
            console.error('Error calculating conception week:', error);
          }
        }
      }
    } catch (error) {
    }
  }, [userInfo.email]);

  useEffect(() => {
    const fetchAndSetResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    };

    const setCurrentDateFormatted = () => {
      const date = new Date();
      const formattedDate = formatDate(date);
      setCurrentDate(formattedDate);
    };

    const fetchImage = async () => {
      try {
        const url = await firebase.storage().ref('miscellaneous/illustration.PNG').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    // Call all functions
    fetchUserInfo();
    fetchAndSetResources();
    setCurrentDateFormatted();
    fetchImage();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (userInfo.email) {
      fetchPersonalisationData();
    }
  }, [userInfo.email, fetchPersonalisationData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [fetchUserInfo])
  );

  const convertStringToDate = (dateString) => {
    if (dateString.length !== 8) {
      throw new Error('Invalid date format. Expected ddmmyyyy.');
    }

    const day = parseInt(dateString.slice(0, 2), 10);
    const month = parseInt(dateString.slice(2, 4), 10) - 1; // Months are 0-indexed in JS Date
    const year = parseInt(dateString.slice(4, 8), 10);

    return new Date(year, month, day);
  };

  const calculateWeeksSince = (startDate) => {
    const today = new Date();
    const diffInMilliseconds = today - startDate;
    const diffInWeeks = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 7));
    return diffInWeeks;
  };

  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
     <View style={[styles.container4,
      {
        ...Platform.select({
          web: { marginBottom: 20 },
          default: { paddingTop: 50, marginBottom: 20 },
        })
      }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <Text style={[styles.textTitle, { marginTop: 20 }]}>Welcome, {userInfo.firstName}!</Text>
    </View>

    <View style={[styles.container4, { marginBottom: 20}]}>
    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 98, height: 120}} />}
      <View style={{marginLeft: 30}}>
        <Text style={[styles.formText, { marginBottom: 10 }]}>You are Pregnant for</Text>
        <Text style={[styles.questionText, { marginBottom: 20 }]}>
          {conceptionWeek !== '' ? `${conceptionWeek} weeks` : '- weeks'}
        </Text>
        
        <Pressable style={[styles.button3]}
          onPress={async () => {
            if (conceptionWeek === '' || conceptionWeek > '40') {
              navigation.navigate('Resources', { category: 'Pregnancy Summary' });
            } else {
              try {
                const response = await axios.get(`${url}/resource`);
                const resources = response.data.resources;
                const resourceForWeek = resources.find(
                  (resource) =>
                    resource.category === 'Pregnancy Summary' &&
                    resource.weekNumber == conceptionWeek
                );
                if (resourceForWeek) {
                  navigation.navigate('UserResourceInfo', { resourceID: resourceForWeek.resourceID });
                } else {
                  // Handle case where no resource is found for the given week
                  console.error('No resource found for the given week');
                }
              } catch (error) {
                console.error('Error fetching resources:', error);
              }}}}>
          <Text style={styles.text}>Details</Text>
        </Pressable>
      </View>
    </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Ionicons name="scale-outline" size={24} color="black" />
        <Pressable onPress={() => navigation.navigate("WeightTracker")} style={{ marginLeft: 10 }}>
          <Text style={styles.questionText}>Weight Tracker</Text>
        </Pressable>
      </View>

      <Text style={[styles.titleNote]}>Suggested for you</Text>
    </View>

      {/* Dynamically get 10 recommended resources */}
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

export default UserDuringHome;
