import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { RichEditor } from 'react-native-pell-rich-editor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keyboard from '../components/Keyboard'; 
import url from '../components/config';
import { Calendar } from 'react-native-calendars';
import { Feather, AntDesign } from '@expo/vector-icons';
import ModalStyle from '../components/ModalStyle';
import styles from '../components/styles';
import moment from 'moment';

const UserBookAppointment = ({ navigation }) => {
    // values
    const [description, setDescription] = useState('');

    const [categoryError, setError1] = useState('');
    const [descriptionError, setError2] = useState('');

    // set selected values
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeButton, setActiveButton] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const [selectedDate, setSelectedDate] = useState('');

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
        if (selectedCategory === category) {
            setSelectedCategory(null);
            setActiveButton('');
        } else {
            setSelectedCategory(category);
            setActiveButton(category);
        }
    };

    const onDayPress = day => {
        setSelectedDate(day.dateString);
    };

    const handleSubmit = async () => {
        // Validate inputs
        if (!selectedCategory) {
            setError1('Please select a category');
            return;
        }
        if (!description) {
            setError2('Please enter a description');
            return;
        }
        if (!selectedDate) {
            Alert.alert('Error', 'Please select a date');
            return;
        }

        try {
            const response = await axios.post(`${url}/appointments`, {
                email: userEmail,
                category: selectedCategory,
                description,
                date: selectedDate,
            });
            if (response.status === 200) {
                Alert.alert('Success', 'Appointment booked successfully');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            Alert.alert('Error', 'Failed to book appointment');
        }
    };
    

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
                    <View style={{flexDirection: 'row'}}>
                    <AntDesign name="left" size={24} color="black" />
                        <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                            <Text style={styles.text}> back </Text>
                        </Pressable>
                </View>
                    <Text style={[styles.pageTitle]}> Book Appointment </Text>
            </View>

                {/* Display specialist details */}
                <View style={styles.appointmentContainer}>
                  <View style={styles.appointmentContainer2}>

                  </View>
                </View>

                <Text style={styles.appointmentText4}>Select Schedule</Text>

                <View style={styles.appointmentContainer3}>
                    <View style={styles.appointmentCircle}/>
                    <Text style={styles.appointmentText5}>Available</Text>

                    <View style={styles.appointmentCircle2} />
                    <Text style={styles.appointmentText5}>Selected</Text>
                </View>

                <Calendar
                    minDate={moment().format('YYYY-MM-DD')}
                    onDayPress={onDayPress}
                    markedDates={{
                        [selectedDate]: { selected: true, selectedColor: '#CBC3E3' },
                    }}
                    theme={{
                        selectedDayBackgroundColor: '#3498db',
                        todayTextColor: '#EE4B2B',
                        arrowColor: '#3498db',
                    }}
                />

                <Text style={styles.appointmentText4}>Time</Text>

                <View style={[styles.container4, { marginBottom: 20}]}>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity
                    onPress={() => handleCategoryButtonClick('10:00')}
                    style={activeButton === '10:00' ? styles.categoryBtnActive : styles.categoryBtn}
                >
                    <Text style={styles.text}>10:00</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleCategoryButtonClick("13:00")}
                    style={activeButton === '13:00' ? styles.categoryBtnActive : styles.categoryBtn}
                >
                    <Text style={styles.text}>13:00</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleCategoryButtonClick("16:00")}
                    style={activeButton === '16:00' ? styles.categoryBtnActive : styles.categoryBtn}
                >
                    <Text style={styles.text}>16:00</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleCategoryButtonClick("18:00")}
                    style={activeButton === '18:00' ? styles.categoryBtnActive : styles.categoryBtn}
                >
                    <Text style={styles.text}>18:00</Text>
                </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.container3, { marginBottom: 20 }]}>
                <Pressable style={[styles.button, { alignSelf: 'center' }]}>
                    <Text style={styles.text}> Book </Text>
                </Pressable>
            </View>

                
            </ScrollView>
    );
};

export default UserBookAppointment;