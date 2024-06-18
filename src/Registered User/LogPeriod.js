import React from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import styles from '../components/styles';
import { AntDesign } from '@expo/vector-icons';

const LogPeriod = ({navigation}) => {
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', 
                   marginBottom: 20 } , Platform.OS!=="web"&&{paddingTop:50}]}>

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight:10 }}>
        <AntDesign name="left" size={24} color="black" />
        <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
          <Text style={styles.text}> back </Text>
        </Pressable>
        </View>

        <Text style= {[styles.pageTitle]}> Log Period </Text>
      </View>

    </ScrollView>
  )
};

export default LogPeriod;