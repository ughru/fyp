import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { storage } from '../../firebaseConfig'; 

// Import your styles and configuration
import styles from '../components/styles';
import url from '../components/config';

const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

const ViewSchedule = ({ navigation }) => {
    const [userEmail, setUserEmail] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [markedDates, setMarkedDates] = useState({});
    const [showAppointmentSelection, setShowAppointmentSelection] = useState(false);
    const [existingAppointments, setExistingAppointments] = useState([]);
    const [existing, setExisting] = useState({});
    const [specialistInfo, setSpecialistInfo] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [imageUrl, setImageUrl] = useState('');

    const fetchSpecialistInfo = useCallback(async () => {
        try {
            const storedEmail = await AsyncStorage.getItem('user');
            if (storedEmail) {
                const response = await axios.get(`${url}/specialistinfo?email=${storedEmail}`);
                if (response.data) {
                    setSpecialistInfo(response.data);
                }
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }, []);

    const fetchExistingAppointments = useCallback(async (userEmail, monthString) => {
        try {
            const response = await axios.get(`${url}/getAppointments`, {
                params: { userEmail, date: monthString }
            });

            if (response.status === 200) {
                const fetchedAppointments = response.data;

                // Mark the fetched appointments on the calendar
                const newMarkedDates = {};
                fetchedAppointments.forEach(appointment => {
                    appointment.appointment.forEach(appt => {
                        newMarkedDates[appt.date] = { selected: true, selectedColor: '#C2D7E3' };
                    });
                });

                setMarkedDates(newMarkedDates); // Set marked dates initially
                setExisting(newMarkedDates); // Store existing appointments separately
                setExistingAppointments(fetchedAppointments);
            }
        } catch (error) {
            console.error('Error fetching existing appointments:', error);
            showAlert('Error', 'Failed to fetch existing appointments');
        }
    }, []);

    const fetchAppointments = useCallback(async () => {
        try {
            if (specialistInfo.email) {
                const response = await axios.get(`${url}/bookedAppt2`, { params: { specialistEmail: specialistInfo.email } });
                const filteredAppointments = response.data;

                const userEmails = filteredAppointments.map(appointment => appointment.userEmail);
                const responses = await Promise.all(
                    userEmails.map(email =>
                        axios.get(`${url}/userinfo`, { params: { email } })
                    )
                );

                const detailsMap = {};
                responses.forEach(response => {
                    const userInfo = response.data;
                    detailsMap[userInfo.email] = userInfo;
                });

                setUserDetails(detailsMap);
                setAppointments(filteredAppointments);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }, [specialistInfo.email]);

    const fetchBookedAppointments = useCallback(async (selectedDate) => {
        try {
            if (specialistInfo.email) {
                const response = await axios.get(`${url}/bookedAppt2`, { params: { specialistEmail: specialistInfo.email } });
                const filteredAppointments = response.data.filter(appointment => 
                    appointment.details.some(detail => detail.date === selectedDate)
                );

                setBookedAppointments(filteredAppointments);
            }
        } catch (error) {
            console.error('Error fetching booked appointments:', error);
        }
    }, [specialistInfo.email]);

    useEffect(() => {
        // Fetch user email from AsyncStorage
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

        const fetchImage = async () => {
            try {
              const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
              setImageUrl(url);
            } catch (error) {
              console.error('Error fetching image:', error);
            }
        };      

        if (userEmail) {
            const currentMonth = moment().format('MMMM YYYY');
            fetchExistingAppointments(userEmail, currentMonth);
        }

        fetchUserEmail();
        fetchImage();
        fetchSpecialistInfo().then(fetchAppointments);
    }, [userEmail, fetchSpecialistInfo, fetchExistingAppointments, fetchAppointments]);

    useFocusEffect(
        useCallback(() => {
            if (userEmail) {
                const currentMonth = moment().format('MMMM YYYY');
                fetchExistingAppointments(userEmail, currentMonth);
            }

            fetchSpecialistInfo().then(fetchAppointments);
        }, [userEmail, fetchSpecialistInfo, fetchExistingAppointments, fetchAppointments])
    );

    const handleMonthChange = useCallback((month) => {
        const monthString = moment(month.dateString).format('MMMM YYYY');
        if (userEmail) {
            fetchExistingAppointments(userEmail, monthString);
        }
    }, [userEmail, fetchExistingAppointments]);

    // Function to handle date selection
    const handleDateSelect = async (date) => {
        const selectedDay = date.dateString;

        // Check if the selected day has existing appointments
        const hasExistingAppointments = existing[selectedDay];

        // Determine the selected color based on existing appointments
        const selectedColor = hasExistingAppointments ? '#C2D7E3' : '#d470af';

        if (hasExistingAppointments) {
            // Check if the selected date is already selected
            if (selectedDay === selectedDate) {
                // If clicking on the already selected date, unselect it
                setSelectedDate('');
                setShowAppointmentSelection(false);
                setMarkedDates({
                    ...existing,
                });
            } else {
                // Mark the selected date on the calendar
                setMarkedDates({
                    ...existing,
                    [selectedDay]: {
                        selected: true,
                        selectedColor: selectedColor,
                        customStyles: {
                            container: {
                                backgroundColor: selectedColor,
                            },
                            text: {
                                color: 'black',
                            },
                        },
                    },
                });

                setSelectedDate(selectedDay); // Set the selected date state
                setShowAppointmentSelection(true); // Show appointment selection section
                fetchBookedAppointments(selectedDay); // Fetch booked appointments for the selected date
            }
        } else {
            // Mark the selected date on the calendar
            setMarkedDates({
                ...existing,
                [selectedDay]: {
                    selected: true,
                    selectedColor: selectedColor,
                    customStyles: {
                        container: {
                            backgroundColor: selectedColor,
                        },
                        text: {
                            color: 'black',
                        },
                    },
                },
            });

            setSelectedDate(selectedDay); // Set the selected date state
            setShowAppointmentSelection(true); // Show appointment selection section
            fetchBookedAppointments(selectedDay); // Fetch booked appointments for the selected date
        }
    };

    return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 30 }, Platform.OS !== "web" && { paddingTop: 50 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 20 }}>
                <AntDesign name="left" size={24} color="black" />
                <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                    <Text style={styles.text}> Back </Text>
                </Pressable>
            </View>
            <Text style={[styles.pageTitle]}> View Schedule </Text>
        </View>

        <Text style={[styles.formText, { marginBottom: 20 }]}> Select a date with existing slots to view </Text>

        {/* Legend Display */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Pressable style={[styles.button8, { backgroundColor: '#C2D7E3', marginLeft: 10 }]} />
            <Text style={[styles.text]}> Existing slots </Text>
            <Pressable style={[styles.button7, { marginLeft: 20 }]} />
            <Text style={[styles.text]}> Selected </Text>
        </View>

        {/* Calendar Component */}
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
                style={{ marginBottom: 30 }}
                markedDates={{ ...markedDates, [selectedDate]: { selected: true, selectedColor: '#d470af' } }}
                onDayPress={handleDateSelect}
                onMonthChange={handleMonthChange}
            />

            {/* Display appointments */}
            {selectedDate !== '' && (
    <View>
        <Text style={[styles.text3, { marginBottom: 10 }]}>Selected Date: {selectedDate}</Text>

        {/* Display existing appointments */}
        {existingAppointments.some(appointment => appointment.appointment.some(appt => appt.date === selectedDate)) ? (
            <View>
                {existingAppointments.map(appointment =>
                    appointment.appointment.map(appt => {
                        if (appt.date === selectedDate) {
                            return (
                                <View key={appt._id} style={{ marginTop: 10, width: '100%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10, marginBottom: 20 }}>
                                    <Text style={[styles.text, { marginBottom: 20 }]}>
                                        Available Timings: {appt.startTime} to {appt.endTime}
                                    </Text>
                                    {appt.interval === 30 ? (
                                        <Text style={[styles.text, { marginBottom: 20 }]}>Interval: 30 mins</Text>
                                    ) : (
                                        <Text style={[styles.text, { marginBottom: 20 }]}>Interval: 1 hour</Text>
                                    )}
                                    {appt.breakTimings.map((breakTiming, index) => (
                                        <View key={index}>
                                            <Text style={[styles.text, { marginBottom: 20 }]}>
                                                {`Break timings: ${breakTiming.start} to ${breakTiming.end}`}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            );
                        }
                        return null;
                    })
                )}
            </View>
        ) : null}

        {/* Display booked appointments */}
        <Text style={[styles.text3, { marginBottom: 10 }]}>Booked Appointments:</Text>
        {bookedAppointments.length > 0 ? (
            bookedAppointments.map((appointment, index) =>
                appointment.details.map((detail, detailIndex) => {
                    if (moment(detail.date).format('YYYY-MM-DD') === moment(selectedDate).format('YYYY-MM-DD')) {
                        return (
                            <View key={detailIndex} style={{ marginTop: 10, width: '100%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10, marginBottom: 20 }}>
                                <Text style={[styles.text, { marginBottom: 10 }]}>
                                    {userDetails[appointment.userEmail]?.firstName} {userDetails[appointment.userEmail]?.lastName}
                                </Text>
                                <Text style={[styles.text, { marginBottom: 10 }]}>
                                    {moment(detail.date, 'YYYY-MM-DD').format('Do MMMM YYYY')}: {detail.time}
                                </Text>
                                <Text style={[styles.text, { marginBottom: 10 }]}>
                                    Status: {detail.status}
                                </Text>
                                {detail.userComments && (
                                    <Text style={[styles.text, { marginBottom: 10 }]}>
                                        User Comments: {detail.userComments}
                                    </Text>
                                )}
                                {detail.specialistNotes && (
                                    <Text style={[styles.text, { marginBottom: 10 }]}>
                                        Specialist Notes: {detail.specialistNotes}
                                    </Text>
                                )}
                            </View>
                        );
                    }
                    return null;
                })
            )
        ) : (
            <View style={{  justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
                {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200 }} />}
                <Text style={[styles.formText, { fontStyle: 'italic' }]}>Oops! Nothing here yet</Text>
            </View>
        )}
    </View>
)}
        </ScrollView>
    );
};

export default ViewSchedule;