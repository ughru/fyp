import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';

const Appointments = ({navigation}) => {
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style= {[styles.pageTitle, {top: 80, left: 20}]}> Appointments </Text>
    </ScrollView>
    </Keyboard>
  );
};

export default Appointments;