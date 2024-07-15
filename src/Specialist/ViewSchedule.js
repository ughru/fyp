import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import url from '../components/config';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

// import own code
import styles from '../components/styles';

const ViewSchedule = ({ navigation }) => {
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
    <ScrollView contentContainerStyle={styles.container}>
        <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 40 }, Platform.OS !== "web" && { paddingTop: 50 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 20 }}>
                <AntDesign name="left" size={24} color="black" />
                <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                    <Text style={styles.text}> back </Text>
                </Pressable>
            </View>
            <Text style={[styles.pageTitle]}> View Schedule </Text>
        </View>

        {/* Legend Display */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Pressable style={[styles.button7, { marginLeft: 20 }]} />
            <Text style={[styles.text]}>Selected</Text>
        </View>

        <Calendar
            hideExtraDays={true}
            markingType={'custom'}
            firstDay={1}
            theme={{
            textSectionTitleColor: '#b6c1cd',
            dayTextColor: '#2d4150',
            selectedDotColor: '#ffffff',
            arrowColor: '#d470af',
            indicatorColor: '#E3C2D7',
            }}
            style= {{marginBottom: 30}}
        />

        {/* Display appointments */}
        
    </ScrollView>
    );
};

export default ViewSchedule;