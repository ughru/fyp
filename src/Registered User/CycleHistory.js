import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { AntDesign } from '@expo/vector-icons';

const CycleHistory = ({navigation}) => {
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style= {[styles.pageTitle, {top: 80}]}> Cycle History </Text>
      <View style={[styles.iconContainer, {top: 85, left: 20}]}>
      <AntDesign name="left" size={24} color="black" />
      </View>
      <Pressable style={[styles.formText, {top: 88, left: 45}]} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.text}> back </Text>
      </Pressable>

    </ScrollView>
    </Keyboard>
  )
};

export default CycleHistory;