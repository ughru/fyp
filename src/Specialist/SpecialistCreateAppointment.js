import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, TouchableOpacity } from 'react-native';
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

const SpecialistCreateAppointment = ({ navigation }) => {
    // set selected values
    const [userEmail, setUserEmail] = useState('');
    const [activeButton, setActiveButton] = useState('Pregnancy');
    const [selectedDate, setSelectedDate] =  useState("");
    const [activeButton2, setActiveButton2] = useState('10:00');

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

    const handleCategoryButtonClick = (category) => {
        setActiveButton(category);
      };

    const handleCategoryButtonClick2 = (category2) => {
        setActiveButton2(category2);
    };

    const onDayPress = day => {
        setSelectedDate(day.dateString);
    };

    return (
        <Keyboard>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
                  <View style={{flexDirection: 'row'}}>
                    <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                      <AntDesign name="left" size={24} color="black" />
                    </Pressable>
                    
                    <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                      <Text style={styles.text}> back </Text>
                    </Pressable>
                  </View>
                  <Text style={styles.pageTitle}>Create Appointment</Text>
                </View>

                <View>
                    <Text style={[styles.questionText, {paddingBottom: 30}]}>Service</Text>
                </View>

                {/*selects the diff category*/}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: 10, marginBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => handleCategoryButtonClick('Pregnancy')}
                        style={activeButton === 'Pregnancy' ? styles.categoryBtnActive : styles.categoryBtn}
                    >
                        <Text style={styles.text}>Pregnancy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleCategoryButtonClick("Fertility")}
                        style={activeButton === 'Fertility' ? styles.categoryBtnActive : styles.categoryBtn}
                    >
                        <Text style={styles.text}>Fertility</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleCategoryButtonClick("Nutrition")}
                        style={activeButton === 'Nutrition' ? styles.categoryBtnActive : styles.categoryBtn}
                    >
                        <Text style={styles.text}>Nutrition</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <Text style={{fontWeight: 'bold', fontSize: 18, paddingTop: 10}}>Select Schedule</Text>
                </View>

                <View style={[styles.appointmentContainer3, {paddingBottom: 20}]}>
                    <View style={styles.appointmentCircle2}/>
                    <Text style={styles.appointmentText5}>Selected</Text>
                </View>

                <Calendar
                    minDate={moment().format('YYYY-MM-DD')}
                    onDayPress={onDayPress}
                    disableAllTouchEventsForDisabledDays={true}
                    markedDates={{
                        [selectedDate] : {selected: true, selectedColor: '#CBC3E3', disableTouchEvent: true}
                    }}
                    theme={{
                        selectedDayBackgroundColor: '#3498db',
                        todayTextColor: '#EE4B2B',
                        arrowColor: '#3498db',
                    }} 
                    style={{
                        marginBottom: 20
                    }}/>

                {/* Time selection */}
                <Text style={[styles.appointmentText4, {paddingBottom: 20}]}>Time</Text>

                <View style={[styles.container4, { marginBottom: 20}]}>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity
                    onPress={() => handleCategoryButtonClick2('10:00')}
                    style={activeButton2 === '10:00' ? styles.categoryBtnActive : styles.categoryBtn}
                >
                    <Text style={styles.text}>10:00</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleCategoryButtonClick2("13:00")}
                    style={activeButton2 === '13:00' ? styles.categoryBtnActive : styles.categoryBtn}
                >
                    <Text style={styles.text}>13:00</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleCategoryButtonClick2("16:00")}
                    style={activeButton2 === '16:00' ? styles.categoryBtnActive : styles.categoryBtn}
                >
                    <Text style={styles.text}>16:00</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleCategoryButtonClick2("18:00")}
                    style={activeButton2 === '18:00' ? styles.categoryBtnActive : styles.categoryBtn}
                >
                    <Text style={styles.text}>18:00</Text>
                </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.container3, { marginBottom: 20 }]}>
                <Pressable style={[styles.button, { alignSelf: 'center' }]}>
                    <Text style={styles.text}> Add Schedule </Text>
                </Pressable>
            </View>

            </ScrollView>
        </Keyboard>
    );
};

export default SpecialistCreateAppointment;