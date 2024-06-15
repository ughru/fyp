import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import styles from '../components/styles';
import { AntDesign } from '@expo/vector-icons';

const LogPeriod = ({navigation}) => {
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', 
                    top: 50, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AntDesign name="left" size={24} color="black" />
        <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
          <Text style={styles.text}> back </Text>
        </Pressable>
        </View>

        <Text style= {[styles.pageTitle, {marginRight: 100}]}> Log Period </Text>
      </View>

    </ScrollView>
  )
};

export default LogPeriod;