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
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
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

  useFocusEffect(
    useCallback(() => {
        fetchUserInfo();
    }, [fetchUserInfo])
  );

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
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, { marginTop: 20 }]}>Welcome, {userInfo.firstName}!</Text>
    </View>

    <View style={[styles.container4, { marginBottom: 20}]}>
    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 98, height: 120}} />}
          <View style={{alignItems: 'center', marginLeft: 30}}>
            <Text style={[styles.formText, { marginBottom: 10 }]}>You are Pregnant for</Text>
            <Text style={[styles.questionText, { marginBottom: 20 }]}>Weeks</Text>
            <Pressable style={[styles.button3]} onPress={() => navigation.navigate('Details')}>
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

      <Text style={[styles.titleNote, {marginBottom: 20}]}>What to expect</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
        <View style={{alignItems: 'center'}}>
          <MaterialCommunityIcons name="baby-face-outline" size={35} color="black" />
          <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Baby's growth</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <MaterialCommunityIcons name="mother-heart" size={35} color="black" />
          <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Body changes</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <MaterialIcons name="health-and-safety" size={35} color="black" />
          <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Health</Text>
        </View>
      </View>
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
