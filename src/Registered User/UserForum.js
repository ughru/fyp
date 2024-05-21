import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather } from '@expo/vector-icons';

const UserForum = ({navigation}) => {
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style= {[styles.pageTitle, {top: 80, left: 20}]}> Community Forum </Text>
      <View style={[styles.iconContainer, {top: 80, left: 330}]}>
        <Feather name="edit" size={24} color="black" />
      </View>
    </ScrollView>
    </Keyboard>
  );
};

export default UserForum;