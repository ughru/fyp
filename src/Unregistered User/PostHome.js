import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};  

const PostHome = ({navigation}) => {
  const [currentDate, setCurrentDate] = useState(null);

  useEffect(() => {
    const date = new Date();
    const formattedDate = formatDate(date);
    setCurrentDate(formattedDate);
  }, []);
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.iconContainer, {top: 80, left: 330}]}>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </View>
      <Text style={[styles.date, {top: 80, left: 20}]}> {currentDate} </Text>
      <Text style={[styles.textTitle, { top: 120, left: 20 }]}> Welcome to Bloom! </Text>

      <Text style={[styles.text, {top: 170, left: 20}]}> Upcoming Appointments </Text>
      <View style={[styles.search, {top: 240, left: 30}]}>
        <Pressable style={styles.button4}>
            <View style={[styles.iconContainer, {left: 20}]}>
              <Feather name="calendar" size={24} color="black" />
            </View>
        </Pressable>
        <Text style={styles.textInputWithIcon2}> No Appointments Yet </Text>
      </View>

      <View style={[styles.iconContainer, {top: 320, left: 20}]}>
        <Ionicons name="scale-outline" size={24} color="black" />
      </View>
      <Pressable style={[styles.formText, {top: 322, left: 50}]}>
        <Text style={styles.questionText}> Weight Tracker </Text>
      </Pressable>

      <Text style={[styles.titleNote, {top: 370, left: 20}]}> Suggested for you </Text>

      <Pressable style={[styles.button, {top: 700}]}>
        <Text style={styles.text}> See more </Text>
      </Pressable>
    </ScrollView>
    </Keyboard>
  );
};

export default PostHome;