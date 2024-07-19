import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Alert, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

// import own code
import styles from '../components/styles';
import url from '../components/config';
import Keyboard from '../components/Keyboard';

const UserCreateAppointment = ({ navigation }) => {
    const [userEmail, setUserEmail] = useState('');
    const [specialisations, setSpecialisations] = useState([]);
    const [specialists, setSpecialists] = useState([]);
    const [markedDates, setMarkedDates] = useState({});
    const [minDate, setMinDate] = useState(moment().format('YYYY-MM-DD'));
    const [showAppointmentSelection, setShowAppointmentSelection] = useState(false);
    const [existingAppointments, setExistingAppointments] = useState([]);
    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [existing, setExisting] = useState({});

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeButton, setActiveButton] = useState('');
    const [selectedSpecialist, setSelectedSpecialist] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentMonth, setCurrentMonth] = useState('');
    const [selectedTime, setSelectedTime] = useState(null);
    const [userComments, setUserComments] = useState('');
    const scrollRef = useRef(null);

    const fetchSpecialisations = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/specialisations`);
            setSpecialisations(response.data);
        } catch (error) {
            console.error('Error fetching specialisations:', error);
        }
    }, []);

    const fetchSpecialists = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/specialistinfo`);
            setSpecialists(response.data.specialists);
        } catch (error) {
            console.error('Error fetching specialists:', error);
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
            Alert.alert('Error', 'Failed to fetch existing appointments');
        }
    }, []);

    const fetchBookedAppointments = useCallback(async (specialistEmail, monthString) => {
        try {
            const response = await axios.get(`${url}/getBookedAppointments`, {
                params: { specialistEmail, date: monthString }
            });
            setBookedAppointments(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch booked appointments');
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (selectedSpecialist && selectedSpecialist.email) {
                const currentMonth = moment().format('MMMM YYYY');
                fetchExistingAppointments(selectedSpecialist.email, currentMonth);
                fetchBookedAppointments(selectedSpecialist.email, currentMonth);
            }
            setSelectedDate('');
        }, [selectedSpecialist, fetchExistingAppointments, fetchBookedAppointments])
    );
    
    const handleMonthChange = useCallback((month) => {
        const monthString = moment(month.dateString).format('MMMM YYYY');
        if (selectedSpecialist && selectedSpecialist.email) {
            fetchExistingAppointments(selectedSpecialist.email, monthString);
            fetchBookedAppointments(selectedSpecialist.email, monthString);
        }
    }, [selectedSpecialist, fetchExistingAppointments, fetchBookedAppointments]);

    // Function to handle date selection
    const handleDateSelect = (date) => {
        const selectedDay = date.dateString;

        // Check if the selected day has existing appointments
        const hasExistingAppointments = existing[selectedDay];

        if (hasExistingAppointments) {
            // Check if the selected date is already selected
            if (selectedDay === selectedDate) {
                // If clicking on the already selected date, unselect it
                setSelectedDate('');
                setShowAppointmentSelection(false);
                // Restore existing marked dates
                setMarkedDates(existing);
            } else {
                // Mark the selected date on the calendar
                setMarkedDates({
                    ...existing,
                    [selectedDay]: {
                        selected: true,
                        selectedColor: '#d470af',
                        customStyles: {
                            container: {
                                backgroundColor: '#d470af',
                            },
                            text: {
                                color: 'black',
                            },
                        },
                    },
                });

                setSelectedDate(selectedDay); // Set the selected date state
                setShowAppointmentSelection(true); // Show appointment selection section
            }
        }
    };

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
        fetchSpecialisations();
        fetchSpecialists();
    }, [fetchSpecialisations, fetchSpecialists]);

    useFocusEffect(
        useCallback(() => {
            fetchSpecialisations();
            fetchSpecialists();
        }, [fetchSpecialisations, fetchSpecialists])
    );

    const handleCategoryButtonClick = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory(null);
            setActiveButton('');
        } else {
            setSelectedCategory(category);
            setActiveButton(category);
        }
    };

    const handleSpecialistClick = (specialist) => {
        setSelectedSpecialist(specialist);
        setCurrentMonth(moment().format('MMMM YYYY'));
    };

    const handleTimeButtonClick = (time) => {
        // Current time for comparison
        const now = moment();
        // Create a moment object for the selected date and time
        const selectedDateTime = moment(selectedDate + ' ' + time, 'YYYY-MM-DD HH:mm');
    
        // Disable time slots that are in the past
        if (now.subtract(30, 'minutes').isAfter(selectedDateTime)) {
            return;
        }
    
        // Filter appointments to get those on the selected date
        const appointmentsOnSelectedDate = bookedAppointments.flatMap(appointment =>
            appointment.details.filter(detail => detail.date === selectedDate)
        );
    
        // Check if the selected time is already booked
        const isTimeBooked = appointmentsOnSelectedDate.some(detail => detail.time === time);
    
        // If the time is booked, return to prevent selection
        if (isTimeBooked) {
            return;
        }
    
        // Toggle the selected time
        if (selectedTime === time) {
            setSelectedTime(null);
        } else {
            setSelectedTime(time);
        }
    };
    
    const filteredSpecialists = specialists.filter(specialist => specialist.specialisation === selectedCategory);

    // generate time buttons
    const generateTimeSlots = (startTime, endTime, interval, breakTimings) => {
        const timeSlots = [];
        let currentTime = moment(startTime, 'HH:mm'); // Ensure startTime is in 'HH:mm' format
    
        while (currentTime.isSameOrBefore(moment(endTime, 'HH:mm'))) {
            const formattedTime = currentTime.format('HH:mm');
            const isInBreak = breakTimings.some(breakTiming => {
                const breakStart = moment(breakTiming.start, 'HH:mm');
                const breakEnd = moment(breakTiming.end, 'HH:mm');
                return currentTime.isBetween(breakStart, breakEnd, null, '[]');
            });
    
            if (!isInBreak) {
                timeSlots.push(formattedTime);
            }
    
            currentTime.add(interval, 'minutes');
        }
    
        return timeSlots;
    };    

    const handleBooking = async () => {
        try {
            const appointmentDetails = {
                date: selectedDate,
                time: selectedTime,
                status: 'Upcoming',
                userComments: userComments,
                specialistNotes: ''
            };

            const response = await axios.post(`${url}/saveAppointment`, {
                date: currentMonth,
                userEmail,
                specialistEmail: selectedSpecialist.email,
                appointmentDetails
            });

            if (response.status === 200) {
                Alert.alert('Success', 'Appointment booked successfully');
                setShowAppointmentSelection(false);
                setSelectedDate('');
                setSelectedTime(null);
                setUserComments('');
                setShowAppointmentSelection(false);
                setMarkedDates(existing);

                // Refetch appointments to update calendar
                fetchExistingAppointments(selectedSpecialist.email, currentMonth);
                fetchBookedAppointments(selectedSpecialist.email, currentMonth);
            } else {
                Alert.alert('Error', 'Failed to book appointment');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to book appointment');
        }
    };

    return(
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[styles.container3, { marginBottom: 20 }]}>
        {/* Specialist schedule view to select and book */}
        {selectedSpecialist ? (
        <View>
            <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }, Platform.OS !== "web" && { paddingTop: 50 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                    <AntDesign name="left" size={24} color="black" />
                    <Pressable style={[styles.formText]} onPress={() => setSelectedSpecialist(null)}>
                        <Text style={styles.text}> back </Text>
                    </Pressable>
                </View>
                <Text style={[styles.pageTitle]}> Book Appointment </Text>
            </View>

            <View style={{ marginBottom: 20, alignItems: 'center' }}>
                {/* Display selected specialist */}
                <Pressable style={{ marginTop: 10, width: '85%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10, marginBottom: 20 }}>
                    <Text style={[styles.text3, { marginBottom: 10 }]}>{selectedSpecialist.firstName} {selectedSpecialist.lastName}</Text>
                    <Text style={[styles.text, { marginBottom: 10 }]}>{selectedSpecialist.specialisation}</Text>
                    <Text style={[styles.text, { marginBottom: 10 }]}>{selectedSpecialist.email}</Text>
                </Pressable>
            </View>

            <Text style={[styles.questionText, { marginBottom: 10 }]}> Select Schedule </Text>
            <Text style={[styles.formText, { marginBottom: 20 }]}> Select a date to book </Text>

             {/* Legend Display */}
             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Pressable style={[styles.button8, { backgroundColor: '#C2D7E3', marginLeft: 10 }]} />
                <Text style={[styles.text]}>Available</Text>
                <Pressable style={[styles.button7, { marginLeft: 20 }]} />
                <Text style={[styles.text]}>Selected</Text>
            </View>

            <Calendar
                hideExtraDays={true}
                markingType={'custom'}
                firstDay={1}
                onDayPress={handleDateSelect}
                onMonthChange={handleMonthChange}
                markedDates={{...markedDates, [selectedDate]: { selected: true, selectedColor: '#d470af', }, }}
                minDate={minDate}
                theme={{
                    textSectionTitleColor: '#b6c1cd',
                    dayTextColor: '#2d4150',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#d470af',
                    indicatorColor: '#E3C2D7',
                }}
                style={{ marginBottom: 30 }}
            />

            {/* Schedule Selection */}
            {selectedDate !== '' && (
            <View style={styles.container3}>
                <Text style={[styles.text3, { marginBottom: 10 }]}>Selected Date: {selectedDate}</Text>

                {existingAppointments.map(appointment => (
                appointment.appointment.map(appt => {
                    if (appt.date === selectedDate) {
                        const timeSlots = generateTimeSlots(appt.startTime, appt.endTime, appt.interval, appt.breakTimings);

                        return (
                        <View key={appt._id} style={{ marginTop: 10, width: '100%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10, marginBottom: 20 }}>
                            <Text style={[styles.formText, { marginBottom: 20 }]}>Select Time: </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                            {timeSlots.map((time, index) => {
                                const selectedDateTime = moment(selectedDate + ' ' + time, 'YYYY-MM-DD HH:mm');
                                const isDisabled = selectedDateTime.isBefore(moment(), 'minute');

                                // Filter appointments to get those on the selected date
                                const appointmentsOnSelectedDate = bookedAppointments.flatMap(appointment =>
                                    appointment.details.filter(detail => detail.date === selectedDate)
                                );
                            
                                // Check if the selected time is already booked
                                const isTimeBooked = appointmentsOnSelectedDate.some(detail => detail.time === time);

                                return (
                                    <Pressable key={index}
                                        style={[ styles.categoryBtn,
                                            selectedTime === time ? styles.categoryBtnActive : null,
                                            isDisabled || isTimeBooked ? styles.disabledButton : null]}
                                        onPress={() => handleTimeButtonClick(time)}
                                        disabled={isDisabled || isTimeBooked}>
                                        <Text style={[styles.text]}>
                                            {time}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                            </View>

                            <Text style={[styles.formText, {marginBottom: 20}]}>Any Additional Information for specialist: </Text>
                            <TextInput style={[styles.input, {marginBottom: 20}]} value={userComments} onChangeText={setUserComments}/>

                            <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={handleBooking}>
                                <Text style={styles.text}> Book Appointment </Text>
                            </Pressable>
                        </View>
                        );
                    }
                })
                ))}
            </View>
            )}
        </View>
    ) : (
        <View style={[styles.container3, { marginBottom: 20 }]}>
            <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }, Platform.OS !== "web" && { paddingTop: 50 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                    <AntDesign name="left" size={24} color="black" />
                    <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                        <Text style={styles.text}> back </Text>
                    </Pressable>
                </View>
                <Text style={[styles.pageTitle]}> Book Appointment </Text>
            </View>

            <View style={{ marginBottom: 20 }}>
                {/* Specialisation buttons */}
                <Text style={[styles.questionText, { marginBottom: 10 }]}> Service </Text>
                <Text style={[styles.formText, { marginBottom: 10 }]}> Select a service </Text>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={Platform.OS === 'web' ? { width: '100%' } : { width: '100%' }}
                    contentContainerStyle={[{ gap: 10, paddingVertical: 10 }, Platform.OS !== 'web' && { flexDirection: 'row', flexWrap: 'nowrap' }]}
                >
                    {specialisations.map((item, index) => (
                        <Pressable key={index}
                            style={[styles.categoryBtn, activeButton === item.specialisationName ? styles.categoryBtnActive : null]}
                            onPress={() => handleCategoryButtonClick(item.specialisationName)}>
                            <Text style={styles.text}>{item.specialisationName}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Display specialists of the category */}
            <Text style={[styles.questionText, { marginBottom: 10 }]}> Specialists </Text>
            <Text style={[styles.formText, { marginBottom: 10 }]}> Select a specalist </Text>
            {filteredSpecialists.map((specialist, index) => (
                <View key={index} style={{ marginBottom: 20, alignItems: 'center' }}>
                        <Pressable
                            style={{ marginTop: 10, width: '85%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10 }}
                            onPress={() => handleSpecialistClick(specialist)}>
                            <Text style={[styles.text3, { marginBottom: 10 }]}>{specialist.firstName} {specialist.lastName}</Text>
                            <Text style={[styles.text, { marginBottom: 10 }]}>{specialist.specialisation}</Text>
                        </Pressable>
                    </View>
                ))}
            </View>
        )}
        </View>
    </ScrollView>
    </Keyboard>
    );
};

export default UserCreateAppointment;