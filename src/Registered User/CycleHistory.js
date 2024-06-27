import React from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

const CycleHistory = ({navigation}) => {
  const today = new Date();
  const currentDateString = today.toISOString().split('T')[0];
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', 
                   marginBottom: 20 } , Platform.OS!=="web"&&{paddingTop:50}]}>

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 30 }}>
        <AntDesign name="left" size={24} color="black" />
        <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
          <Text style={styles.text}> back </Text>
        </Pressable>
      </View>

      <Text style= {[styles.pageTitle]}> Cycle History </Text>
    </View>

    <View style={[styles.container4, {marginTop: 20, marginBottom: 20}]}>
      {/* Information Section */}
      <Text style= {[styles.text3, {marginBottom: 10}]}> Last Period: </Text>
      <Text style= {[styles.text3, {marginBottom: 10}]}> Period Prediction: </Text>
      <Text style= {[styles.text3, {marginBottom: 40}]}> Last Cycle Length: </Text>

      {/* Calendar */}
      <Calendar
        current={currentDateString}  // Set the initial 
        markedDates={{
          [currentDateString]: { selected: true, selectedColor: '#E3C2D7' }, // Mark today as selected
        }}
        hideExtraDays={true}
        disableMonthChange={true}
        firstDay={1}  // Start week on Monday 
        theme={{
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: '#d470af',
          indicatorColor: '#E3C2D7',
        }}
      />

    </View>

    </ScrollView>
    </Keyboard>
  )
};

export default CycleHistory;