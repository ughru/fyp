import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather } from '@expo/vector-icons';

const Forum = ({navigation}) => {
  //Variables to ask user for forum input
  const [forumDesc, setForumDesc] = useState('');

  const addForumHandler = async() => {
    //If empty
    if(!forumDesc.trim()) {
      Alert.alert("Error", "Please enter what you want to discuss");
      return;
    }
  }
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Forum Content Input */}
      <TextInput
        style={[styles.input, { height: 200 }]} // Increase height for content
        placeholder="Enter forum content"
        multiline
        value={forumDesc}
        onChangeText={setForumDesc}
      />
    </ScrollView>
    </Keyboard>
  );
};

export default Forum;