import React from 'react';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';

const DuringHome = ({navigation}) => {
 
  // Page Displays
  return (
    <View style={styles.container}>
      <Text style={[styles.text, {top:200}]}> During Home </Text>
    </View>
  );
};

export default DuringHome;
