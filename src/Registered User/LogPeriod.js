import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import styles from '../components/styles';
import { AntDesign, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import url from '../components/config';
import axios from 'axios';
import Calendar from '../components/Calendar';

const symptomsList = [
  'Abdominal Cramps',
  'Appetite Changes',
  'Acne',
  'Bloating',
  'Breast Tenderness',
  'Headaches',
  'Fatigue',
  'Diarrhea/Constipation',
  'Sleep Disturbance'
];

const LogPeriod = ({ navigation, route }) => {
  const [activeButton, setActiveButton] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [mood, setMood] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const [typeError, setError1] = useState('');
  const [symptomsError, setError2] = useState('');
  const [moodError, setError3] = useState('');

  useEffect(() => {
    if (route.params && route.params.selectedDate) {
      setSelectedDate(route.params.selectedDate);
    } else {
      setSelectedDate(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format
    }
  }, [route.params]);

  const handleFlow = (type) => {
    if (selectedType === type) {
      setSelectedType(null);
      setActiveButton('');
    } else {
      setSelectedType(type);
      setActiveButton(type);
    }
  };

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(item => item !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleMood = (selectedMood) => {
    if (mood === selectedMood) {
      setMood(null);
    } else {
      setMood(selectedMood);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    let valid = true;

    if (!selectedType) {
      setError1('* Please select a flow type');
      valid = false;
    } else {
      setError1('');
    }

    if (selectedSymptoms.length === 0) {
      setError2('* Please select at least one symptom');
      valid = false;
    } else {
      setError2('');
    }

    if (!mood) {
      setError3('* Please select a mood');
      valid = false;
    } else {
      setError3('');
    }

    if (valid) {
      try {
        const storedEmail = await AsyncStorage.getItem('user');
        if (!storedEmail) {
          Alert.alert('Error', 'User email not found');
          return;
        }
        
        const periodLogData = {
          userEmail: storedEmail,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          record: {
            date: formatDate(selectedDate),
            flowType: selectedType,
            symptoms: selectedSymptoms,
            mood: mood
          }
        };
  
        // Make POST request to backend API to create or update period log
        const response = await axios.post(`${url}/periodLog`, periodLogData);
  
        if (response.status === 201) {
          Alert.alert('Success', 'Period Log successfully created!', [{
            text: 'OK', onPress: () => {
              navigation.goBack(); 
            }
          }], { cancelable: false });
        } else {
          Alert.alert('Error', 'Failed to create Period Log');
        }
      } catch (error) {
        Alert.alert('Error', 'Period Log for today already exist!');
      }
    };
  }

  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[{
        flexDirection: 'row', width: '100%', alignItems: 'center',
        marginBottom: 30
      }, Platform.OS !== "web" && { paddingTop: 50 }]}>

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 40 }}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>

        <Text style={[styles.pageTitle]}> Log Period </Text>
      </View>

      {/* Cycle History Button */}
      <View style={[styles.container4]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="history" size={24} color="black" />
          <Pressable onPress={() => navigation.navigate("CycleHistory")} style={{ marginLeft: 10 }}>
            <Text style={styles.questionText}>Cycle History</Text>
          </Pressable>
        </View>

        {/* Calendar View */}
        <Calendar selectedDate={selectedDate} />

        {/* Flow Selection*/}
        <Text style={[styles.questionText, { marginTop: 20, marginBottom: 20 }]}> Menstrual Flow </Text>
        {typeError ? <Text style={[styles.error, { marginBottom: 20 }]}>{typeError}</Text> : null}
        <View style={[styles.buttonPosition, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={[
              styles.button6, { marginHorizontal: 10 },
              activeButton === 'Light' ? styles.button6 : styles.defaultButton,
            ]}
            onPress={() => handleFlow('Light')}>

            <Text> Light </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button6, { marginHorizontal: 10 },
          activeButton === 'Medium' ? styles.button6 : styles.defaultButton,]}
            onPress={() => handleFlow('Medium')}>
            <Text> Medium </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button6, { marginHorizontal: 10 },
          activeButton === 'Heavy' ? styles.button6 : styles.defaultButton,]}
            onPress={() => handleFlow('Heavy')}>
            <Text> Heavy </Text>
          </TouchableOpacity>
        </View>

        {/* Symptoms */}
        <Text style={[styles.questionText, { marginBottom: 20 }]}> Symptoms </Text>
        <Text style={[styles.formText, { marginBottom: 20 }]}> Select all that applies </Text>
        {symptomsError ? <Text style={[styles.error, { marginBottom: 20 }]}>{symptomsError}</Text> : null}

        {symptomsList.map((symptom, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Text style={[styles.text, { flex: 1 }]}>{symptom}</Text>
            <Pressable
              style={[selectedSymptoms.includes(symptom) ? styles.button8 : styles.button10, { marginRight: 20 }]}
              onPress={() => toggleSymptom(symptom)}
            >
              <Text style={{ color: 'white' }}>{selectedSymptoms.includes(symptom) ? '✓' : ''}</Text>
            </Pressable>
          </View>
        ))}

        {/* Mood */}
        <Text style={[styles.questionText, { marginBottom: 20 }]}> Mood </Text>
        {moodError ? <Text style={[styles.error, { marginBottom: 20 }]}>{moodError}</Text> : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handleMood('Happy')}>
            <FontAwesome6 name="face-smile" size={35} color={mood === 'Happy' ? '#E3C2D7' : 'black'} />
            <Text style={[styles.text, { marginTop: 10, textAlign: 'center' }]}> Happy </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handleMood('Sad')}>
            <FontAwesome6 name="face-frown" size={35} color={mood === 'Sad' ? '#E3C2D7' : 'black'} />
            <Text style={[styles.text, { marginTop: 10, textAlign: 'center' }]}> Sad </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handleMood('Anxious')}>
            <FontAwesome6 name="face-tired" size={35} color={mood === 'Anxious' ? '#E3C2D7' : 'black'} />
            <Text style={[styles.text, { marginTop: 10, textAlign: 'center' }]}> Anxious </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handleMood('Irritated')}>
            <FontAwesome6 name="face-angry" size={35} color={mood === 'Irritated' ? '#E3C2D7' : 'black'} />
            <Text style={[styles.text, { marginTop: 10, textAlign: 'center' }]}> Irritated </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Button */}
      <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={handleSave}>
        <Text style={styles.text}> Log </Text>
      </Pressable>

    </ScrollView>
  )
};

export default LogPeriod;