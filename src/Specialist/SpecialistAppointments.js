import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather } from '@expo/vector-icons';

const SpecialistAppointments = ({navigation}) => {
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container3, Platform.OS!=="web"&&{paddingTop:50}]}>
        <Text style={[styles.pageTitle]}> Appointments</Text>
      </View>
    </ScrollView>
  );
};

export default SpecialistAppointments;