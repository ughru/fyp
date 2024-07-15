import React, { useEffect, useState } from 'react';
import { View, Text, Pressable , Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';

// Fetch User Selection from Personalisation.js
const Settings = ({ navigation, selectedStatus, setSelectedStatus }) => {
  const handleStatusSelection = async (status) => {
    setSelectedStatus(status);

    try {
      await AsyncStorage.setItem('selectedStatus', status);
    } catch (error) {
      console.error('Error storing selected status:', error);
    }
  };

  useEffect(() => {
    const fetchSelectedStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem('selectedStatus');
        if (storedStatus !== null) {
          setSelectedStatus(storedStatus);
        }
        else {
          setSelectedStatus('Pre');
        }
      } catch (error) {
        console.error('Error retrieving selected status:', error);
      }
    };

    fetchSelectedStatus();
  }, []);

  return (
    <View style={[styles.container]}>
      <Text style={[styles.pageTitle, Platform.OS !== "web" && { paddingTop: 50 }]}> Settings </Text>
      <Text style={[styles.titleNote, { paddingTop: 10, paddingBottom: 10 }]}> Manage your account </Text>

      <View style={[styles.container4]}>
        <Text style={[styles.questionText, { marginBottom: 20 }]}> Pregnancy Status </Text>
        <View style={[styles.buttonPosition, {marginBottom: 20}]}>
          <Pressable
            style={[
              styles.button6, { marginHorizontal: 10 },
              selectedStatus === 'Pre' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('Pre')}
          >
            <Text>{selectedStatus === 'Pre' ? 'Pre' : 'Pre'}</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button6, { marginHorizontal: 10 },
              selectedStatus === 'During' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('During')}
          >
            <Text>{selectedStatus === 'During' ? 'During' : 'During'}</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button6, { marginHorizontal: 10 },
              selectedStatus === 'Post' ? styles.button6 : styles.defaultButton,
            ]}
            disabled={!selectedStatus}
            onPress={() => handleStatusSelection('Post')}
          >
            <Text>{selectedStatus === 'Post' ? 'Post' : 'Post'}</Text>
          </Pressable>
        </View>
        
        <Text style= {[styles.questionText, { marginBottom: 20 }]}>Others</Text>
        <Pressable style={[styles.formText, {marginBottom: 20}]} onPress={() => navigation.navigate("Personalisation")}>
          <Text style={[styles.text]}> Personalisation </Text>
        </Pressable>
      </View>

      <View style={[styles.container3, { alignItems: 'center', paddingHorizontal: 20, justifyContent: 'center' }]}>
        <Text style={[styles.pageTitle, { marginBottom: 20 }]}> Join Bloom </Text>
        <Pressable style={styles.button5} onPress={() => navigation.navigate("RegisterUser")}>
          <Text style={styles.questionText}> Register </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Settings;