import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather, Ionicons } from '@expo/vector-icons';

const Resource = ({navigation}) => {
  const [search, setSearch] = useState('');

  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style= {[styles.pageTitle, {top: 80, left: 20}]}> Resource Hub </Text>
      <View style={[styles.iconContainer, {top: 80, left: 330}]}>
        <Feather name="download" size={24} color="black" />
      </View>

      {/* Search Bar */}
      <View style={[styles.search, {top: 150, left: 20}]}>
        <View style={[styles.iconContainer, {left: 10}]}>
        <Ionicons name="search-outline" size={24} color="black" />
        </View>
        <TextInput style={[styles.input3, styles.textInputWithIcon]} value={search} onChangeText={setSearch}
          placeholder="Search" placeholderTextColor="black"/>
      </View>
    </ScrollView>
    </Keyboard>
  );
};

export default Resource;