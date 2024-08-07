import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { TimePickerModal } from 'react-native-paper-dates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import axios from 'axios';

// Import your styles and configuration
import styles from '../components/styles';
import url from '../components/config';

const showAlert = (title, message, onPress) => {
  if (Platform.OS === 'web') {
    // For web platform
    window.alert(`${title}\n${message}`);
    if (onPress) onPress();  // Execute the onPress callback for web
  } else {
    // For mobile platforms
    Alert.alert(title, message, [{ text: 'OK', onPress }], { cancelable: false });
  }
};

const CreateAppointments = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [minDate, setMinDate] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [breakEndTime, setBreakEndTime] = useState(null);
  const [isBreakStartTimePickerVisible, setBreakStartTimePickerVisible] = useState(false);
  const [isBreakEndTimePickerVisible, setBreakEndTimePickerVisible] = useState(false);
  const [interval, setInterval] = useState('30'); // Default interval is 30 minutes
  const [breakTimings, setBreakTimings] = useState([]);
  const [showAppointmentSelection, setShowAppointmentSelection] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [existing, setExisting] = useState({});
  const [refreshDisplay, setRefreshDisplay] = useState(false); // State for triggering display refresh

  // errrors
  const [startTimeError, setError1] = useState('');
  const [endTimeError, setError2] = useState('');
  const [breakError, setError3] = useState('');

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

  useEffect(() => {
    // Set minimum date as today
    const today = moment().format('YYYY-MM-DD');
    setMinDate(today);
  }, []);

  const fetchExistingAppointments = useCallback(async (userEmail, monthString) => {
    try {
      const response = await axios.get(`${url}/getAppointments`, {
        params: { userEmail, date: monthString }
      });
  
      if (response.status === 200) {
        const fetchedAppointments = response.data;
        const today = moment().startOf('day'); // Start of today's date
        const newMarkedDates = {};
  
        for (const appointment of fetchedAppointments) {
          for (const appt of appointment.appointment) {
            const appointmentDate = moment(appt.date);
  
            if (appointmentDate.isBefore(today)) {
              // If the appointment date is before today, delete it from the database
              await axios.delete(`${url}/deleteAppointments`, {
                data: { userEmail, date: appt.date }
              });
            } else {
              // Otherwise, mark it on the calendar
              newMarkedDates[appt.date] = { selected: true, selectedColor: '#C2D7E3' };
            }
          }
        }
  
        setMarkedDates(newMarkedDates); // Set marked dates initially
        setExisting(newMarkedDates); // Store existing appointments separately
        setExistingAppointments(fetchedAppointments);
      }
    } catch (error) {
      console.error('Error fetching existing appointments:', error);
      showAlert('Error', 'Failed to fetch existing appointments');
    }
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      if (userEmail) {
        const currentMonth = moment().format('MMMM YYYY');
        fetchExistingAppointments(userEmail, currentMonth);
      }
    }, [userEmail, fetchExistingAppointments])
  );

  const handleMonthChange = useCallback((month) => {
    const monthString = moment(month.dateString).format('MMMM YYYY');
    if (userEmail) {
      fetchExistingAppointments(userEmail, monthString);
    }
  }, [userEmail, fetchExistingAppointments]);

  // Function to handle date selection
  const handleDateSelect = (date) => {
    const selectedDay = date.dateString;

    if (existing[selectedDay]) {
      setMarkedDates({
        ...existing,
        [existing]: {
          selected: false,
        },
      });
      return;
    }

    if (selectedDay === selectedDate) {
      // If clicking on the already selected date, unselect it
      setSelectedDate('');
      setShowAppointmentSelection(false);
      setMarkedDates(existing); // Restore existing marked dates
      setStartTime(null); // Clear start time
      setEndTime(null); // Clear end time
      setInterval('30');
      setBreakStartTime(null); // Clear start time
      setBreakEndTime(null); // Clear end time
      setBreakTimings([]); // Clear break timings
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
  };

  // Function to handle setting start time
  const handleSetStartTime = (time) => {
    setStartTime(time);
    setStartTimePickerVisible(false); // Hide the time picker
  };

  // Function to handle setting end time
  const handleSetEndTime = (time) => {
    setEndTime(time);
    setEndTimePickerVisible(false); // Hide the time picker
  };

  // Function to handle selecting interval (30 mins or 1 hr)
  const handleIntervalSelect = (selectedInterval) => {
    setInterval(selectedInterval);
  };

  // Function to handle setting break start time
  const handleSetBreakStartTime = (time) => {
    setBreakStartTime(time);
    setBreakStartTimePickerVisible(false); // Hide the break time picker

    // Add new break timing object with start time
    const newBreakTiming = { start: moment(time).format('HH:mm'), end: null }; // End time initially null
    setBreakTimings([...breakTimings, newBreakTiming]);
  };

  // Function to handle setting break end time
  const handleSetBreakEndTime = (time) => {
    // Get the last break timing object from array
    const updatedBreakTimings = breakTimings.map((breakTiming, index) => {
      if (index === breakTimings.length - 1) {
        return { ...breakTiming, end: moment(time).format('HH:mm') };
      }
      return breakTiming;
    });

    setBreakTimings(updatedBreakTimings);
    setBreakEndTime(time);
    setBreakEndTimePickerVisible(false); // Hide the break time picker
  };

  const handleSubmit = async () => {
    let valid = true;

    const appointmentData = {
      userEmail: userEmail,
      date: moment(selectedDate).format('MMMM YYYY'), // Format as Month Year
      appointment: [{
        date: selectedDate, // Date selected on calendar
        startTime: startTime ? moment(startTime).format('HH:mm') : '',
        endTime: endTime ? moment(endTime).format('HH:mm') : '',
        interval: interval,
        breakTimings: breakTimings,
      }],
    };

    try {
      // error handling
      if (!startTime) {
        setError1('* Required field');
        valid = false;
      } else {
        setError1('');
      }

      if (!endTime) {
        setError2('* Required field');
        valid = false;
      } else {
        setError2('');
      }

      if (!breakStartTime || !breakEndTime) {
        setError3('* Required field');
        valid = false;
      } else {
        setError3('');
      }

      if (valid) {
        const response = await axios.post(`${url}/appointments`, appointmentData);

        if (response.status === 201) {
          // Appointment saved successfully
          showAlert('Success', 'Appointment saved successfully');
          setShowAppointmentSelection(false); // Close appointment selection section
          setSelectedDate(''); // Clear selected date
          setMarkedDates({}); // Clear marked dates
          setStartTime(null); // Clear start time
          setEndTime(null); // Clear end time
          setBreakTimings([]); // Clear break timings
          setRefreshDisplay(true); // Trigger display refresh
        } else {
          throw new Error('Error saving appointment');
        }}
    } catch (error) {
      console.error('Error saving appointment:', error.message);
      showAlert('Error', 'Failed to save appointment');
    }
  };

  // useEffect to handle display refresh
  useEffect(() => {
    if (refreshDisplay) {
      // Refresh display logic here (e.g., refetch appointments)
      const currentMonth = moment().format('MMMM YYYY');
      fetchExistingAppointments(userEmail, currentMonth);
      setRefreshDisplay(false); // Reset refresh state
    }
  }, [refreshDisplay, userEmail, fetchExistingAppointments]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 30 }, Platform.OS !== 'web' && { paddingTop: 50 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> Back </Text>
          </Pressable>
        </View>
        <Text style={[styles.pageTitle]}> Create Appointment </Text>
      </View>

      <Text style={[styles.formText, { marginBottom: 20 }]}> Select a date with no slots to create </Text>

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
        markedDates={markedDates}
        minDate={minDate}
        onDayPress={handleDateSelect}
        onMonthChange={handleMonthChange} 
      />

      {/* Appointment Selection */}
      {showAppointmentSelection && (
        <View style={styles.container3}>
          <Text style={[styles.text3, { marginBottom: 10 }]}>Selected Date: {selectedDate}</Text>
          <Text style={styles.formText}>Start Time: {startTimeError ? <Text style={styles.error}>{startTimeError}</Text> : null} </Text>
          <Pressable onPress={() => setStartTimePickerVisible(true)} style={[styles.button, { marginBottom: 20 }]}>
            <Text style={styles.text}> {startTime ? moment(startTime).format('HH:mm') : 'Select Start Time'}</Text>
          </Pressable>
          <Text style={styles.formText}>End Time: {endTimeError ? <Text style={styles.error}>{endTimeError}</Text> : null} </Text>
          <Pressable onPress={() => setEndTimePickerVisible(true)} style={[styles.button, { marginBottom: 20 }]}>
            <Text style={styles.text}> {endTime ? moment(endTime).format('HH:mm') : 'Select End Time'}</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Text style={styles.formText}>Interval: </Text>
            <Pressable onPress={() => handleIntervalSelect(interval === '30' ? '60' : '30')} style={[styles.button, { marginLeft: 10 }]}>
              <Text style={styles.text}>{interval === '30' ? '30 minutes' : '1 hour'}</Text>
            </Pressable>
          </View>

          <Text style={styles.formText}>Break Timings: {breakError ? <Text style={styles.error}>{breakError}</Text> : null} </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Pressable onPress={() => setBreakStartTimePickerVisible(true)} style={[styles.button, { marginBottom: 20 }]}>
              <Text style={styles.text}> {breakStartTime ? moment(breakStartTime).format('HH:mm') : 'Select Break Start Time'}</Text>
            </Pressable>
            <Text style={styles.formText}> to </Text>
            <Pressable onPress={() => setBreakEndTimePickerVisible(true)} style={[styles.button, { marginBottom: 20 }]}>
              <Text style={styles.text}> {breakEndTime ? moment(breakEndTime).format('HH:mm') : 'Select Break End Time'}</Text>
            </Pressable>
          </View>

          <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={handleSubmit}>
            <Text style={styles.text}> Add Schedule </Text>
          </Pressable>
        </View>
      )}

      {/* Time Picker Modals */}
      <TimePickerModal
        visible={isStartTimePickerVisible}
        onDismiss={() => setStartTimePickerVisible(false)}
        onConfirm={handleSetStartTime}
        hours={12} // Hours to display (default is 24)
        minutes={30} // Minutes to display (default is 60)
        label="Select Start Time"
      />

      <TimePickerModal
        visible={isEndTimePickerVisible}
        onDismiss={() => setEndTimePickerVisible(false)}
        onConfirm={handleSetEndTime}
        hours={12} // Hours to display (default is 24)
        minutes={30} //
        label="Select End Time"
      />

      {/* Break Time Picker Modals */}
      <TimePickerModal
        visible={isBreakStartTimePickerVisible}
        onDismiss={() => setBreakStartTimePickerVisible(false)}
        onConfirm={handleSetBreakStartTime}
        hours={12} // Hours to display (default is 24)
        minutes={30} // Minutes to display (default is 60)
        label="Select Break Start Time"
      />

      <TimePickerModal
        visible={isBreakEndTimePickerVisible}
        onDismiss={() => setBreakEndTimePickerVisible(false)}
        onConfirm={handleSetBreakEndTime}
        hours={12} // Hours to display (default is 24)
        minutes={30} // Minutes to display (default is 60)
        label="Select Break End Time"
      />

    </ScrollView>
  );
};

export default CreateAppointments;