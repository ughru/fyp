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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', 
                    top: 50, marginBottom: 20 }}>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>

        <Text style= {[styles.pageTitle, {marginRight: 80}]}> Cycle History </Text>
      </View>

    </ScrollView>
    </Keyboard>
  )
};

export default CycleHistory;