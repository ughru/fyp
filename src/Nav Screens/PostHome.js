import React from 'react';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';

const PostHome = ({navigation}) => {
 
  // Page Displays
  return (
    <View style={styles.container}>
      <Text style={[styles.text, {top:200}]}> Post Home </Text>
    </View>
  );
};

export default PostHome;
