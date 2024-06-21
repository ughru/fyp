import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';

// Fetch User Selection from Personalisation.js
const Settings = ({ navigation, selectedStatus, setSelectedStatus }) => {
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
    <View style = {[styles.container]}>
      <Text style={[styles.pageTitle, {top: 50, marginBottom: 20}]}> Settings </Text>
      <Text style={[styles.titleNote, {marginTop: 40, marginBottom: 30}]}> Manage your account </Text>
      
      <View style = {[styles.container3]}>
        <Text style={[styles.questionText, {marginBottom: 20}]}> Pregnancy Status </Text>
        <View style={styles.buttonPosition}>
          <Pressable
            style={[
              styles.button6, {marginHorizontal: 10},
              selectedStatus === 'Pre' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('Pre')}
          >
            <Text>{selectedStatus === 'Pre' ? 'Pre' : 'Pre'}</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button6, {marginHorizontal: 10},
              selectedStatus === 'During' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('During')}
          >
            <Text>{selectedStatus === 'During' ? 'During' : 'During'}</Text>
          </Pressable>

<<<<<<< Updated upstream
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
=======
          <Pressable
            style={[
              styles.button6, {marginHorizontal: 10},
              selectedStatus === 'Post' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('Post')}
          >
            <Text>{selectedStatus === 'Post' ? 'Post' : 'Post'}</Text>
          </Pressable>
        </View>
      </View>
      
      <View style = {[styles.container3, {alignItems: 'center' , paddingHorizontal:20 , justifyContent:'center'}]}>
        <Text style={[styles.pageTitle, {marginBottom: 20}]}> Join Bloom </Text>
        <Pressable style={styles.button5} onPress={() => navigation.navigate("AccountType")}>
          <Text style={styles.questionText}> Register </Text>
        </Pressable>
        <Pressable style={{width: 270,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 10,
        backgroundColor: '#E3C2D7'}} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.questionText}> Login </Text>
        </Pressable>
      </View>
>>>>>>> Stashed changes
    </View>
  );
};

export default Settings;