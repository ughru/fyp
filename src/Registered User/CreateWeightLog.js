import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { RichEditor } from 'react-native-pell-rich-editor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keyboard from '../components/Keyboard'; 
import url from '../components/config';

// import own code
import styles from '../components/styles';

const CreateWeightLog = ({ navigation }) => {

    return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
            <Text style={[styles.pageTitle]}> Create Weight Log</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
            <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                <Entypo name="cross" size={30} color="black" />
            </Pressable>
            </View>
        </View>

    </ScrollView>
    </Keyboard>
    );
};

export default CreateWeightLog;