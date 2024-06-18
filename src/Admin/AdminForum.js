import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather } from '@expo/vector-icons';

const AdminForum = ({navigation}) => {
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[{ flexDirection: 'row', justifyContent:'space-between', width: '100%', alignItems: 'center', 
                   marginBottom: 20 } , Platform.OS!=="web"&&{paddingTop:50}]}>
        <Text style= {[styles.pageTitle]}> Community Forum </Text>
      </View>
    </ScrollView>
    </Keyboard>
  );
};

export default AdminForum;