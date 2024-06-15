import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather } from '@expo/vector-icons';

const AdminForum = ({navigation}) => {
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', 
                    top: 50, marginBottom: 20 }}>
        <Text style= {[styles.pageTitle]}> Community Forum </Text>
      </View>
    </ScrollView>
    </Keyboard>
  );
};

export default AdminForum;