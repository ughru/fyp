import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import styles from './components/styles';

// Store (unregistered only) user selection
const Personalisation = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleStatusSelection = async (status) => {
    setSelectedStatus(status);
    
    // Store user selection locally
    await AsyncStorage.setItem('selectedStatus', status);

    // Navigate to the appropriate screen based on user selection
    if (status === 'Pre' || status == "During" || status == "Post") {
      navigation.navigate("HomePage");
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.questionText, {top: 200}]}> What's your purpose of using Bloom? </Text>
      
      <Pressable style={[styles.button2, {top: 270}]} onPress={() =>handleStatusSelection('Pre')}>
        <Text style={styles.text}> Pre Pregnancy </Text>
      </Pressable>

      <Pressable style={[styles.button2, {top: 360}]} onPress={() =>handleStatusSelection('During')}>
        <Text style={styles.text}> During Pregnancy </Text>
      </Pressable>

      <Pressable style={[styles.button2, {top: 450}]} onPress={() =>handleStatusSelection('Post')}>
        <Text style={styles.text}> Post Pregnancy </Text>
      </Pressable>
    </View>
  );
};

export default Personalisation;
