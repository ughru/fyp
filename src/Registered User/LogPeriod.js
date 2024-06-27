import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, TouchableOpacity } from 'react-native';
import styles from '../components/styles';
import { AntDesign, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';

const getWeek = () => {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentDay = today.getDate();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + i);
    weekDates.push(date.getDate());
  }

  return { weekDays, weekDates, currentDay };
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

const LogPeriod = ({navigation}) => {
  const { weekDays, weekDates, currentDay } = getWeek();
  const [activeButton, setActiveButton] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [mood, setMood] = useState(false);

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


  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', 
                   marginBottom: 30 } , Platform.OS!=="web"&&{paddingTop:50}]}>

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
      <View style={{ flexDirection: 'row', alignItems: 'center'}}>
        <MaterialIcons name="history" size={24} color="black" />
        <Pressable onPress={() => navigation.navigate("CycleHistory")} style={{ marginLeft: 10 }}>
          <Text style={styles.questionText}>Cycle History</Text>
        </Pressable>
      </View>

      {/* Calendar View */}
      <View style={[styles.calendarContainer]}>
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
      <Text style= {[styles.questionText, {marginTop: 20, marginBottom: 20}]}> Menstrual Flow </Text>
      <View style={[styles.buttonPosition, {marginBottom: 20}]}>
          <TouchableOpacity
          style={[
              styles.button6, {marginHorizontal: 10},
              activeButton === 'Light' ? styles.button6 : styles.defaultButton,
            ]}
            onPress={() => handleFlow('Light')}>

            <Text> Light </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button6, {marginHorizontal: 10},
            activeButton === 'Medium' ? styles.button6 : styles.defaultButton,]}
            onPress={() => handleFlow('Medium')}>
            <Text> Medium </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button6, {marginHorizontal: 10},
          activeButton === 'Heavy' ? styles.button6 : styles.defaultButton,]}
          onPress={() => handleFlow('Heavy')}>
            <Text> Heavy </Text>
          </TouchableOpacity>
        </View>
      
      {/* Symptoms */}
      <Text style= {[styles.questionText, {marginBottom: 20}]}> Symptoms </Text>
      <Text style= {[styles.formText, {marginBottom: 20}]}> Select all that applies </Text>

      {symptomsList.map((symptom, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.text, { flex: 1 }]}>{symptom}</Text>
          <Pressable
            style={[selectedSymptoms.includes(symptom) ? styles.button8 : styles.button10, {marginRight: 20}]}
            onPress={() => toggleSymptom(symptom)}
          >
            <Text style={{ color: 'white' }}>{selectedSymptoms.includes(symptom) ? '✓' : ''}</Text>
          </Pressable>
        </View>
      ))}

      {/* Mood */}
      <Text style= {[styles.questionText, {marginBottom: 20}]}> Mood </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 20}}>
        <TouchableOpacity style={{alignItems: 'center'}} onPress={() => handleMood('Happy')}>
          <FontAwesome6 name="face-smile" size={35} color={mood === 'Happy' ? '#E3C2D7' : 'black'} />
          <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}> Happy </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{alignItems: 'center'}} onPress={() => handleMood('Sad')}>
          <FontAwesome6 name="face-frown" size={35} color={mood === 'Sad' ? '#E3C2D7' : 'black'} />
          <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}> Sad </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{alignItems: 'center'}} onPress={() => handleMood('Anxious')}>
          <FontAwesome6 name="face-tired" size={35} color={mood === 'Anxious' ? '#E3C2D7' : 'black'} />
          <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}> Anxious </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{alignItems: 'center'}} onPress={() => handleMood('Irritated')}>
          <FontAwesome6 name="face-angry" size={35} color={mood === 'Irritated' ? '#E3C2D7' : 'black'} />
          <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}> Irritated </Text>
        </TouchableOpacity>
      </View>

    </View>

    {/* Button */}
    <Pressable style={[styles.button, { alignSelf: 'center' }]} >
      <Text style={styles.text}> Log </Text>
    </Pressable>

    </ScrollView>
  )
};

export default LogPeriod;