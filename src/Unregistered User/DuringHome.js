import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../components/styles';
import { fetchResources } from '../components/manageResource';
import ModalStyle from '../components/ModalStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {storage} from '../../firebaseConfig';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const DuringHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [resources, setResources] = useState([]);
  const scrollRef = useRef();
  const [isModalVisible, setModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [selections, setSelections] = useState({});
  const [q5Option, setQ5Option] = useState('');
  const [conceptionWeek, setConceptionWeek] = useState('');

  useEffect(() => {
    const date = new Date();
    const formattedDate = formatDate(date);

    const fetchAndSetResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    };

    const fetchImage = async () => {
      try {
        const url = await storage.ref('miscellaneous/illustration.PNG').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    const fetchSelections = async () => {
      try {
        const storedSelections = await AsyncStorage.getItem('userSelections');
        if (storedSelections !== null) {
          const parsedSelections = JSON.parse(storedSelections);
          setSelections(parsedSelections);
          
          // Check for q5 option and set it
          if (parsedSelections.q5) {
            setQ5Option(parsedSelections.q5);
          }
        }
      } catch (error) {
        console.error('Error retrieving personalisation response:', error);
      }
    };

    fetchSelections();
    fetchAndSetResources();
    setCurrentDate(formattedDate);
    fetchImage();
  }, []);

  useEffect(() => {
    if (q5Option) {
      try {
        const dateObject = convertStringToDate(q5Option);
        const weeks = calculateWeeksSince(dateObject);
        setConceptionWeek(weeks + 3); 
      } catch (error) {
        console.error('Error converting q5Option to date:', error.message);
      }
    }
  }, [q5Option]);

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

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.container4,
        {...Platform.select({
          web: {marginBottom:20},
          default: {paddingTop:50, marginBottom: 20},
        })}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, { marginTop: 20}]}>Welcome to Bloom!</Text>
      </View>

      <View style={[styles.container4, { marginBottom: 20}]}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 98, height: 120}} />}
          <View style={{ marginLeft: 30}}>
            <Text style={[styles.formText, { marginBottom: 10 }]}>You are Pregnant for</Text>
            <Text style={[styles.questionText, { marginBottom: 20 }]}>
              {conceptionWeek !== '' ? `${conceptionWeek} weeks` : '- weeks'}
            </Text>
            <Pressable style={[styles.button3]} onPress={toggleModal}>
              <Text style={styles.text}>Details</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="scale-outline" size={24} color="black" />
          <Pressable  style={{ marginLeft: 10 }} onPress={toggleModal}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>

        <Text style={[styles.titleNote]}>Suggested for you</Text>
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
                onPress={toggleModal}
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

      <ModalStyle  isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
    </ScrollView>
  );
};

export default DuringHome;