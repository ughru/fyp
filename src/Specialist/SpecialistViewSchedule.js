import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { RichEditor } from 'react-native-pell-rich-editor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keyboard from '../components/Keyboard'; 
import url from '../components/config';
import { Feather, AntDesign, Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

// import own code
import styles from '../components/styles';

const SpecialistViewSchedule = ({ navigation }) => {
    // values
    const [description, setDescription] = useState('');
    const [descriptionError, setError1] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    // set selected values
    const [userEmail, setUserEmail] = useState('');

    // Fetch user email
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('user');
                if (storedEmail) {
                    setUserEmail(storedEmail);
                }
            } catch (error) {
                console.error('Error fetching user email:', error);
            }
        };

        fetchUserEmail();
    }, []);

    const onDayPress = day => {
        setSelectedDate(day.dateString);
    };

    return (
        <Keyboard>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
                  <View style={{flexDirection: 'row'}}>
                    <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                      <AntDesign name="left" size={24} color="black" />
                    </Pressable>
                    
                    <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                      <Text style={styles.text}> back </Text>
                    </Pressable>
                  </View>
                  <View style={{paddingLeft: 30}}>
                    <Text style={styles.pageTitle}>View Schedule</Text>
                  </View>
                </View>

                <View style={[styles.appointmentContainer3, {marginBottom: 20}]}>
                    <View style={styles.appointmentCircle2} />
                    <Text style={styles.appointmentText5}>Selected</Text>
                </View>

                <Calendar 
                    minDate={moment().format('YYYY-MM-DD')}
                    onDayPress={onDayPress}
                    disableAllTouchEventsForDisabledDays={true}
                    markedDates={{
                        [selectedDate] : {selected: true, selectedColor: '#CBC3E3'}
                    }}
                />

                
            </ScrollView>
        </Keyboard>
    );
};

export default SpecialistViewSchedule;