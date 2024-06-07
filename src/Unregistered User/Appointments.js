import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import styles from '../components/styles';

const Appointments = ({navigation}) => {
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container3, {top: 50}]}>
        <Text style={[styles.pageTitle, {marginBottom: 570, marginRight: 120}]}> Appointments</Text>
      </View>
    </ScrollView>
  );
};

export default Appointments;