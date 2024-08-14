import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Platform, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import styles from '../components/styles';
import { fetchResources } from '../components/manageResource';
import ModalStyle from '../components/ModalStyle';
import Calendar from '../components/Calendar';
import axios from 'axios';
import url from '../components/config';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const PreHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [resources, setResources] = useState([]);
  const [dietReco, setDietReco] = useState([]);
  const scrollRef = useRef();
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const date = new Date();
    const formattedDate = formatDate(date);

    const fetchAndSetResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    };

    const dietRecos = async () => {
      setLoading(true);
      try {
        // Fetch resources from the backend
        const response = await axios.get(`${url}/resource`);
        const allResources = response.data.resources;
    
        // Retrieve user selections from AsyncStorage
        const userSelections = await AsyncStorage.getItem('userSelections');
        const selections = userSelections ? JSON.parse(userSelections) : {};
        const userBmiCategory = selections.q2 || '';
    
        // If q2 is not available, set an empty dietReco and exit
        if (!userBmiCategory) {
          setDietReco([]);
          return;
        }
    
        // Map user BMI category to resource BMI category
        let bmi = '';
        switch (userBmiCategory) {
          case 'Underweight (BMI < 18.5)':
            bmi = 'Underweight';
            break;
          case 'Normal weight (BMI 18.5-24.9)':
            bmi = 'Normal';
            break;
          case 'Overweight (BMI 25-29.9)':
            bmi = 'Overweight';
            break;
          case 'Obese (BMI 30 or higher)':
            bmi = 'Obese';
            break;
          default:
            bmi = '';
            break;
        }
    
        // Filter resources based on the mapped BMI category
        const filteredResources = bmi
          ? allResources.filter(resource =>
              resource.category === 'Diet Recommendations' && resource.bmi.includes(bmi)
            )
          : allResources.filter(resource =>
              resource.category === 'Diet Recommendations'
            );
    
        // Function to get random resources
        const getRandomResources = (resources, num) => {
          const shuffled = resources.sort(() => 0.5 - Math.random());
          return shuffled.slice(0, num);
        };
    
        const randomResources = getRandomResources(filteredResources, 10);
    
        // Update state with the random resources
        setDietReco(randomResources);
      } catch (error) {
        console.error('Error fetching diet recommendations:', error);
        setDietReco([]);
      } finally {
        setLoading(false); 
      }
    };    

    fetchAndSetResources();
    dietRecos();
    setCurrentDate(formattedDate);
  }, []);

  const toggleModal = () => { 
    setModalVisible(!isModalVisible);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
       <View style = {[styles.container4 , {...Platform.select({web:{} , default:{paddingTop:50}})}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <Text style={[styles.textTitle, {paddingTop: 10}]}>Welcome to Bloom!</Text>
      </View>

      <View style = {[styles.container4]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable style={styles.button7} />
          <Text style={[styles.text, { marginLeft: 10 }]}>Today</Text>
          <Pressable style={[styles.button8, { marginLeft: 30 }]} />
          <Text style={[styles.text, { marginLeft: 10 }]}>Ovulation</Text>
        </View>

        <View>
          <Calendar />
        </View>

        <Pressable style={[styles.button, { alignSelf: 'center', marginTop: 20, marginBottom: 20 }]} onPress={toggleModal}>
          <Text style={styles.text}>Log Period</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <MaterialIcons name="history" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={toggleModal}>
            <Text style={styles.questionText}>Cycle History</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="scale-outline" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={toggleModal}>
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
              <TouchableOpacity style={styles.resourceBtn} onPress={toggleModal}>
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
        )}
      </View>

      <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => navigation.navigate("Resources")}>
        <Text style={styles.text}>See more</Text>
      </Pressable>

      <ModalStyle  isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
    </ScrollView>
  );
};

export default PreHome;