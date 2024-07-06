import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import styles from '../components/styles';
import { AntDesign, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import url from '../components/config';
import axios from 'axios';

const getWeek = (startDate) => {
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const startDateObj = new Date(startDate);
    const currentDay = startDateObj.getDate();
    const firstDayOfWeek = new Date(startDateObj);
    firstDayOfWeek.setDate(startDateObj.getDate() - startDateObj.getDay());
  
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      weekDates.push(date.getDate());
    }
  
    return { weekDays, weekDates, currentDay };
};

const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

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

const UpdatePeriodLog = ({ navigation, route }) => {
  const { log } = route.params;
  const { weekDays, weekDates, currentDay } = getWeek(formatDate(log.record[0].date));
  const [activeButton, setActiveButton] = useState('');
  const [selectedType, setSelectedType] = useState(log.record[0].flowType); 
  const [selectedSymptoms, setSelectedSymptoms] = useState(log.record[0].symptoms);
  const [mood, setMood] = useState(log.record[0].mood);

  const [typeError, setError1] = useState('');
  const [symptomsError, setError2] = useState('');
  const [moodError, setError3] = useState('');

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
            date: formatDate(log.record[0].date),
            flowType: selectedType,
            symptoms: selectedSymptoms,
            mood: mood
          }
        };
  
        // Update period log
        const response = await axios.put(`${url}/updatePeriodLog`, periodLogData);
  
        if (response.status === 200) {
          Alert.alert('Success', 'Period Log successfully updated!', [{
            text: 'OK', onPress: () => {
              navigation.goBack(); 
            }
          }], { cancelable: false });
        } else {
          Alert.alert('Error', 'Failed to update Period Log');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to update Period Log');
      }
    };
  }

  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[{
        flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20
      }, Platform.OS !== "web" && { paddingTop: 50 }]}>

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 30 }}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>

        <Text style={[styles.pageTitle]}> Update Period </Text>
      </View>

      {/* Cycle History Button */}
      <View style={[styles.container4]}>
        {/* Calendar View */}
        <View style={styles.calendarContainer}>
            <View style={styles.header}>
                {weekDays.map((day, index) => (
                <Text key={index} style={styles.dayLabel}>{day}</Text>
                ))}
            </View>
            <View style={styles.days}>
                {weekDates.map((date, index) => (
                <Text key={index} style={[styles.date2, date === currentDay && styles.currentDate]}>{date}</Text>
                ))}
            </View>
        </View>

         {/* Flow Selection*/}
         <Text style={[styles.questionText, { marginTop: 20, marginBottom: 20 }]}> Menstrual Flow </Text>
        {typeError ? <Text style={[styles.error, { marginBottom: 20 }]}>{typeError}</Text> : null}
        <View style={[styles.buttonPosition, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={[
              styles.button6, { marginHorizontal: 10 },
              selectedType === 'Light' ? styles.button6 : styles.defaultButton,
            ]}
            onPress={() => handleFlow('Light')}>

            <Text> Light </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button6, { marginHorizontal: 10 },
          selectedType === 'Medium' ? styles.button6 : styles.defaultButton,]}
            onPress={() => handleFlow('Medium')}>
            <Text> Medium </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button6, { marginHorizontal: 10 },
          selectedType === 'Heavy' ? styles.button6 : styles.defaultButton,]}
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
        <Text style={styles.text}> Update </Text>
      </Pressable>

    </ScrollView>
  )
};

export default UpdatePeriodLog;