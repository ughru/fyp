import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';

// Fetch User Selection from Personalisation.js
const Settings = ({navigation, selectedStatus, setSelectedStatus}) => {
  const handleStatusSelection = async (status) => {
    setSelectedStatus(status);

    // Store user selection locally
    try {
      await AsyncStorage.setItem('selectedStatus', status);
    } catch (error) {
      console.error('Error storing selected status:', error);
    }
  };
 
  // Page Displays
  return (
    <View style={styles.container}>
      <Text style= {[styles.pageTitle, {top: 80, left: 20}]}> Settings </Text>
      <Text style= {[styles.titleNote, { top: 120, left: 20}]}> Manage your account </Text>

      <Text style= {[styles.questionText, {top: 180, left: 20}]}> Pregnancy Status </Text>
      <Pressable
        style={[
          styles.button6,
          { top: 220, left: 20 },
          selectedStatus === 'Pre' ? styles.button6 : styles.defaultButton,
        ]}
        disabled={!selectedStatus}
        onPress={() => handleStatusSelection('Pre')}
      >
        <Text>{selectedStatus === 'Pre' ? 'Pre' : 'Pre'}</Text>
      </Pressable>

      <Pressable
        style={[
          styles.button6,
          { top: 220, left: 120 },
          selectedStatus === 'During' ? styles.button6 : styles.defaultButton,
        ]}
        disabled={!selectedStatus}
        onPress={() => handleStatusSelection('During')}
      >
        <Text>{selectedStatus === 'During' ? 'During' : 'During'}</Text>
      </Pressable>

      <Pressable
        style={[
          styles.button6,
          { top: 220, left: 220 },
          selectedStatus === 'Post' ? styles.button6 : styles.defaultButton,
        ]}
        disabled={!selectedStatus}
        onPress={() => handleStatusSelection('Post')}
      >
        <Text>{selectedStatus === 'Post' ? 'Post' : 'Post'}</Text>
      </Pressable>

      <Text style= {[styles.pageTitle, {top: 400}]}> Join Bloom </Text>
      <Pressable style={[styles.button5, {top: 450}]} onPress={() =>navigation.navigate("AccountType")}>
        <Text style= {styles.questionText}> Register </Text>
      </Pressable>
      <Pressable style={[styles.button5, {top: 500}]} onPress={() =>navigation.navigate("Login")}>
        <Text style= {styles.questionText}> Login </Text>
      </Pressable>
    </View>
  );
};

export default Settings;
