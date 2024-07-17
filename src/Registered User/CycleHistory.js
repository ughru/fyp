import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Alert } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import url from '../components/config';

const CycleHistory = ({ navigation }) => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today);
  const [markedDates, setMarkedDates] = useState({});
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [selectedLog, setSelectedLog] = useState([]);
  const [periodLogs, setPeriodLogs] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('user');
      if (!storedEmail) {
        Alert.alert('Error', 'User email not found');
        return;
      }

      // Fetch period logs for the selected month
      const monthString = selectedMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const responseMonth = await axios.get(`${url}/getPeriodLogMonth`, {
        params: { userEmail: storedEmail, date: monthString }
      });

      // Fetch all period logs
      const responseAll = await axios.get(`${url}/allPeriodLog`, {
        params: { userEmail: storedEmail }
      });

      if (responseMonth.status === 200 && responseAll.status === 200) {
        const periodLogsMonth = responseMonth.data;
        const periodLogsAll = responseAll.data;

        // Process period logs to mark dates on the calendar
        const newMarkedDates = {};
        periodLogsMonth.forEach(log => {
          log.record.forEach(record => {
            newMarkedDates[record.date] = { selected: true, selectedColor: '#d470af' };
          });
        });

        setMarkedDates(newMarkedDates);
        setPeriodLogs(periodLogsAll);

        // Calculate last period and cycle length
        findLastPeriod(periodLogsAll);
        calculateCycleLength(periodLogsAll);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData(); // Initial fetch when component mounts
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData(); // Fetch data when screen is focused
    }, [fetchData])
  );

  // display last period date (the start)
  const findLastPeriod = (periodLogs) => {
    let lastPeriodDate = '';

    periodLogs.forEach(log => {
      log.record.forEach(record => {
        if (!lastPeriodDate || new Date(record.date) > new Date(lastPeriodDate)) {
          lastPeriodDate = record.date;
        }
      });
    });

    if (lastPeriodDate) {
      const date = new Date(lastPeriodDate);
      const formattedDate = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setLastPeriod(formattedDate);
    } else {
      setLastPeriod('-');
    }
  };

  // display cycle length
  const calculateCycleLength = (periodLogs) => {
    let lastPeriodDate = '';
    let secondLastPeriodDate = '';

    periodLogs.forEach(log => {
      log.record.forEach(record => {
        const recordDate = new Date(record.date);
        if (!lastPeriodDate || recordDate > new Date(lastPeriodDate)) {
          secondLastPeriodDate = lastPeriodDate;
          lastPeriodDate = record.date;
        } else if (!secondLastPeriodDate || recordDate > new Date(secondLastPeriodDate)) {
          secondLastPeriodDate = record.date;
        }
      });
    });

    if (lastPeriodDate && secondLastPeriodDate) {
      const lastDate = new Date(lastPeriodDate);
      const secondLastDate = new Date(secondLastPeriodDate);
      const timeDiff = lastDate - secondLastDate;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      setCycleLength(`${daysDiff} days`);
    } else {
      setCycleLength('-');
    }
  };

  return (
    <Keyboard>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }, Platform.OS !== "web" && { paddingTop: 50 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 30 }}>
            <AntDesign name="left" size={24} color="black" />
            <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
              <Text style={styles.text}> back </Text>
            </Pressable>
          </View>
          <Text style={[styles.pageTitle]}> Cycle History </Text>
        </View>

        {/* Information Section */}
        <View style={[styles.container4, { marginTop: 20, marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={[styles.text3]}> Last Period:</Text>
            <Text style={{fontSize: 18}}> {lastPeriod} </Text> 
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={[styles.text3]}> Period Prediction: </Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 30 }}>
            <Text style={[styles.text3]}> Last Cycle Length: </Text>
            <Text style={{fontSize: 18}}> {cycleLength} </Text> 
          </View>

          {/* Legend Display */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
            <Pressable style={[styles.button7, , { marginLeft: 20 }]} />
            <Text style={[styles.text]}>Period Log</Text>
            <Pressable style={[styles.button8, { backgroundColor: '#C2C7E3', marginLeft: 20 }]} />
            <Text style={[styles.text]}>Ovulation Prediction</Text>
          </View>

          <Calendar
            markedDates={markedDates}
            hideExtraDays={true}
            markingType={'custom'}
            onDayPress={(day) => {
              const selectedDateString = day.dateString;
              const selectedLog = periodLogs.find(log => log.record.some(record => record.date === selectedDateString));
              setSelectedLog(selectedLog);
            }}
            onMonthChange={(month) => {
              setSelectedMonth(new Date(month.year, month.month - 1));
            }}
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

          {/* Render selected log details */}
          {periodLogs.map((log, index) => (
            <View key={index} style={{ marginBottom: 20 }}>
              {selectedLog === log && (
                <Pressable style={{ marginTop: 10, borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10  }}
                onPress={() => navigation.navigate('UpdatePeriodLog', { log: selectedLog })}>
                  {log.record.map((record, recordIndex) => (
                    <View key={recordIndex} style={{ marginBottom: 10 }}>
                      <Text style= {[styles.questionText, {marginBottom: 10, textDecorationLine: 'underline'}]}> Period Information </Text>
                      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={[styles.text, {fontWeight: 'bold'}]}>Date:</Text>
                        <Text style={styles.text}> {record.date} </Text> 
                      </View>
                      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={[styles.text, {fontWeight: 'bold'}]}> Flow Type:</Text>
                        <Text style={styles.text}>  {record.flowType} </Text> 
                      </View>
                      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={[styles.text, {fontWeight: 'bold'}]}> Symptoms:</Text>
                        <Text style={[styles.text, {flex: 1}]}>  {record.symptoms.join(', ')} </Text> 
                      </View>
                      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={[styles.text, {fontWeight: 'bold'}]}> Mood:</Text>
                        <Text style={styles.text}> {record.mood} </Text> 
                      </View>
                    </View>
                  ))}
                </Pressable>
              )}
            </View>
          ))}
          </View>
      </ScrollView>
    </Keyboard>
  );
};

export default CycleHistory;