import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import url from '../components/config';

const CycleHistory = ({ navigation, route }) => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today);
  const [markedDates, setMarkedDates] = useState({});
  const [lastPeriod, setLastPeriod] = useState('');
  const [predictedPeriod, setPredictedPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [selectedLog, setSelectedLog] = useState([]);
  const [periodLogs, setPeriodLogs] = useState([]);
  const [ovulationDates, setOvulationDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(route.params?.date || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const storedEmail = await AsyncStorage.getItem('user');
      if (!storedEmail) {
        showAlert('Error', 'User email not found');
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

        // Calculate and mark ovulation dates
        calculateOvulationDates(periodLogsAll);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); 
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData(); // Initial fetch when component mounts
  }, [fetchData]);

  useEffect(() => {
    if (route.params?.date) {
      setSelectedDate(route.params.date);
    }
  }, [route.params?.date]);

  useFocusEffect(
    useCallback(() => {
      fetchData(); // Fetch data when screen is focused
    }, [fetchData])
  );

  // display last period date (the start)
  const findLastPeriod = async (periodLogs) => {
    setLoading(true);
    try {
        // Get the current month from today's date
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Calculate the previous month
        const previousMonth = new Date(today);
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const previousMonthString = `${previousMonth.getFullYear()}-${(previousMonth.getMonth() + 1).toString().padStart(2, '0')}`;

        let lastPeriodDate = '';

        // Check current month logs
        const currentMonthLogs = periodLogs.filter(log => {
            return new Date(log.record[0].date).getMonth() === today.getMonth() &&
                   new Date(log.record[0].date).getFullYear() === today.getFullYear();
        });

        if (currentMonthLogs.length > 0) {
            lastPeriodDate = currentMonthLogs[0].record[0].date;
        } else {
            // Check previous month logs if no records for the current month
            const responsePreviousMonth = await axios.get(`${url}/getPeriodLogMonth`, {
                params: { userEmail: await AsyncStorage.getItem('user'), date: previousMonthString }
            });

            if (responsePreviousMonth.status === 200) {
                const previousMonthLogs = responsePreviousMonth.data;
                if (previousMonthLogs.length > 0) {
                    lastPeriodDate = previousMonthLogs[0].record[0].date;
                }
            }
        }

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
    } catch (error) {
        console.error('Error finding last period:', error);
        setLastPeriod('-');
    } finally {
      setLoading(false); 
    }
  };

  // display cycle length + predict next period + ovulation
  const calculateCycleLength = (periodLogs) => {
    setLoading(true);
    try {
        let currentMonthFirstDate = '';
        let previousMonthFirstDate = '';

        const today = new Date();
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1); 
        const previousMonth = new Date(currentMonth);
        previousMonth.setMonth(previousMonth.getMonth() - 1); 

        periodLogs.forEach(log => {
            log.record.forEach(record => {
                const recordDate = new Date(record.date);
                if (recordDate.getFullYear() === currentMonth.getFullYear() && recordDate.getMonth() === currentMonth.getMonth()) {
                    if (!currentMonthFirstDate || recordDate < new Date(currentMonthFirstDate)) {
                        currentMonthFirstDate = record.date;
                    }
                } else if (recordDate.getFullYear() === previousMonth.getFullYear() && recordDate.getMonth() === previousMonth.getMonth()) {
                    if (!previousMonthFirstDate || recordDate < new Date(previousMonthFirstDate)) {
                        previousMonthFirstDate = record.date;
                    }
                }
            });
        });

        if (currentMonthFirstDate && previousMonthFirstDate) {
            const currentMonthDate = new Date(currentMonthFirstDate);
            const previousMonthDate = new Date(previousMonthFirstDate);
            const timeDiff = currentMonthDate - previousMonthDate;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

            setCycleLength(`${daysDiff} days`);

            // Calculate predicted period date
            const nextPeriodDate = new Date(currentMonthDate);
            nextPeriodDate.setDate(nextPeriodDate.getDate() + daysDiff);
            const formattedPredictedDate = nextPeriodDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
            setPredictedPeriod(formattedPredictedDate);
        } else {
            setCycleLength('-');
            setPredictedPeriod('-');
        }

        // Calculate ovulation dates
        calculateOvulationDates(periodLogs);

    } catch (error) {
        setCycleLength('-');
        setPredictedPeriod('-');
        setOvulationDates({});
    } finally {
      setLoading(false); 
    }
  };

  const calculateOvulationDates = (periodLogs) => {
    setLoading(true);
    try {
        const today = new Date();
        const currentMonthFirstDate = new Date(today.getFullYear(), today.getMonth(), 1); // First date of the current month

        let firstRecordDate = '';

        // Find the first record of the current month
        periodLogs.forEach(log => {
            log.record.forEach(record => {
                const recordDate = new Date(record.date);
                if (recordDate >= currentMonthFirstDate && (!firstRecordDate || recordDate < new Date(firstRecordDate))) {
                    firstRecordDate = record.date;
                }
            });
        });

        if (firstRecordDate && cycleLength !== '-') {
            const firstRecordStartDate = new Date(firstRecordDate);
            const cycleLengthDays = parseInt(cycleLength, 10);

            let ovulationDayOffset = 0;

            // Calculate ovulation day based on cycle length
            if (cycleLengthDays < 31) {
                ovulationDayOffset = Math.floor(cycleLengthDays / 2);
            } else if (cycleLengthDays === 31) {
                ovulationDayOffset = 16;
            } else if (cycleLengthDays === 32) {
                ovulationDayOffset = 17;
            } else if (cycleLengthDays === 33) {
                ovulationDayOffset = 18;
            } else if (cycleLengthDays === 34) {
                ovulationDayOffset = 19;
            } else if (cycleLengthDays >= 35) {
                ovulationDayOffset = 20;
            }

            // Determine the ovulation date
            const ovulationDate = new Date(firstRecordStartDate);
            ovulationDate.setDate(firstRecordStartDate.getDate() + ovulationDayOffset);

            // Create ovulation dates range
            const ovulationDatesRange = {};
            for (let i = -4; i <= 1; i++) {
                const rangeDate = new Date(ovulationDate);
                rangeDate.setDate(ovulationDate.getDate() + i);
                ovulationDatesRange[rangeDate.toISOString().split('T')[0]] = {selected: true, selectedColor: '#C2C7E3'};
            }

            setOvulationDates(ovulationDatesRange);
            setMarkedDates(prevMarkedDates => ({
                ...prevMarkedDates,
                ...ovulationDatesRange,
            }));
        } else {
          setOvulationDates([]); // Set ovulation dates to an empty array if cycle length is null or invalid
          setMarkedDates(prevMarkedDates => ({
            ...prevMarkedDates,
            ...{} // Remove any existing ovulation date markings
          }));
        }
    } catch (error) {
        console.error('Error calculating ovulation dates:', error);
        setOvulationDates({});
    } finally {
      setLoading(false); 
    }
  };

  const onDayPress = (day) => {
    const selectedDateString = day.dateString;

    // Find the log for the selected date
    const selectedLog = periodLogs.find(log =>
        log.record.some(record => record.date === selectedDateString)
    );

    if (!selectedLog) {
        // Navigate to LogPeriod screen if no existing period log for the selected date
        navigation.navigate('LogPeriod', { selectedDate: day.dateString });
    } else {
        // Extract the individual record matching the selected date
        let selectedRecord = null;
        if (selectedLog) {
            selectedRecord = selectedLog.record.find(record => record.date === selectedDateString);
        }

        // Set the selectedLog state
        setSelectedLog(selectedLog);
        setSelectedDate(selectedDateString);
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
            <Text style={{fontSize: 18}}> {predictedPeriod} </Text> 
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
            markedDates={{ ...markedDates, ...ovulationDates }}
            hideExtraDays={true}
            markingType={'custom'}
             onDayPress={onDayPress}
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
            style={{ marginBottom: 30 }}
          />

          {/* Render selected log details */}
          {periodLogs.map((log, index) => (
            <View key={index} style={{ marginBottom: 20 }}>
              {selectedLog === log && (
                <Pressable
                  style={{ marginTop: 10, borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10 }}
                  onPress={() => {
                    const selectedRecord = log.record.find(record => record.date === selectedDate);
                    navigation.navigate('UpdatePeriodLog', { record: selectedRecord });
                  }}>
                  {log.record
                    .filter(record => record.date === selectedDate) // Filter records by the selected date
                    .map((record, recordIndex) => (
                      <View key={recordIndex} style={{ marginBottom: 10 }}>
                        <Text style={[styles.questionText, { marginBottom: 10, textDecorationLine: 'underline' }]}> Period Information </Text>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                          <Text style={[styles.text, { fontWeight: 'bold' }]}>Date:</Text>
                          <Text style={styles.text}> {record.date} </Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                          <Text style={[styles.text, { fontWeight: 'bold' }]}> Flow Type:</Text>
                          <Text style={styles.text}> {record.flowType} </Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                          <Text style={[styles.text, { fontWeight: 'bold' }]}> Symptoms:</Text>
                          <Text style={[styles.text, { flex: 1 }]}> {record.symptoms.join(', ')} </Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                          <Text style={[styles.text, { fontWeight: 'bold' }]}> Mood:</Text>
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