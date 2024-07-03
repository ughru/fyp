import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import styles from './components/styles';
import { AntDesign } from '@expo/vector-icons';

const Personalisation = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleStatusSelection = async (status) => {
    setSelectedStatus(status);
    
    // Store user selection locally
    await AsyncStorage.setItem('selectedStatus', status);

    // Navigate to the appropriate screen based on user selection
    if (status === 'Pre' || status === 'During' || status === 'Post') {
      navigation.navigate("HomePage");
    }
  };
  
  return (
    <ScrollView contentContainerStyle={[styles.container]}>
      {/* Back Button */}
      <View style={[styles.container4, Platform.OS !== "web" && { paddingTop: 50 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom:120 }}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>

        <View style={[styles.container3, {paddingTop: 60, justifyContent: 'center', alignItems: 'center'}]}>
          <Text style={styles.questionText}>What's your purpose of using Bloom?</Text>
          
          <Pressable style={styles.button2} onPress={() => handleStatusSelection('Pre')}>
            <Text style={styles.text}>Pre Pregnancy</Text>
          </Pressable>

          <Pressable style={styles.button2} onPress={() => handleStatusSelection('During')}>
            <Text style={styles.text}>During Pregnancy</Text>
          </Pressable>

          <Pressable style={styles.button2} onPress={() => handleStatusSelection('Post')}>
            <Text style={styles.text}>Post Pregnancy</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default Personalisation;