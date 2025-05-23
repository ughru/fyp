import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keyboard from '../components/Keyboard';
import url from '../components/config';

// import own code
import styles from '../components/styles';

const showAlert = (title, message, onConfirm = () => {}) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'OK', onPress: onConfirm }
      ]);
    }
  };

const CreateWeightLog = ({ navigation }) => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState('');

    const [heightError, setError1] = useState('');
    const [weightError, setError2] = useState('');

    const [userInfo, setUserInfo] = useState([]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('user');
                if (storedEmail) {
                    const response = await axios.get(`${url}/userinfo?email=${storedEmail}`);
                    if (response.data) {
                        const { email } = response.data;
                        setUserInfo({ email });
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();

    }, []);

    useEffect(() => {
        if (height && weight) {
            const heightInMeters = parseFloat(height) / 100;
            const bmiValue = parseFloat(weight) / (heightInMeters * heightInMeters);
            setBmi(bmiValue.toFixed(2));
        }
    }, [height, weight]);

    const onSave = async () => {
        let valid = true;

        // Validate input fields
        if (!height.trim()) {
            setError1('* Required field');
            valid = false;
        } else if (!/^[0-9]+(\.[0-9]+)?$/.test(height)) {
            setError1('* Height must be a valid number');
            valid = false;
        } else {
            setError1('');
        }

        if (!weight.trim()) {
            setError2('* Required field');
            valid = false;
        } else if (!/^[0-9]+(\.[0-9]+)?$/.test(weight)) {
            setError2('* Weight must be a valid number');
            valid = false;
        } else {
            setError2('');
        }

        if (valid) {
            try {
                const storedEmail = await AsyncStorage.getItem('user');
                if (!storedEmail) {
                    showAlert('Error', 'User email not found');
                    return;
                }
    
                // Prepare weight log data
                const weightLog = {
                    userEmail: storedEmail,
                    record: {
                        date: new Date(),
                        height: parseFloat(height),
                        weight: parseFloat(weight),
                        bmi: parseFloat(bmi),
                        category: getCategory(parseFloat(bmi))
                    }
                };
    
                // Send weight log data to backend
                const response = await axios.post(`${url}/weightLog`, weightLog);
    
                if (response.status === 201) {
                    showAlert('Success', 'Weight Log successfully created!', () => {
                        navigation.goBack(); 
                    });
                } else {
                    showAlert('Failure', 'Weight Log was not created.');
                }
            } catch (error) {
                showAlert('Failure', 'Weight Log for today already exist.');
            }
        }
    };

    const getCategory = (bmi) => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi >= 18.5 && bmi <= 23.0) return 'Normal Weight';
        if (bmi >= 23 && bmi <= 29.9) return 'Overweight';
        return 'Obese';
    };

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

        {/* User Form Inputs */}
        <View style={[styles.container4, { marginBottom: 20 }]}>
            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.text, { marginBottom: 10 }]}> Height (cm) {heightError ? <Text style={styles.error}>{heightError}</Text> : null} </Text>
                <TextInput style={[styles.input3]} value={height} onChangeText={setHeight} keyboardType="numeric" />
            </View>

            <View style={[styles.container4, { marginBottom: 20 }]}>
                <Text style={[styles.text, { marginBottom: 20 }]}> Weight (kg) {weightError ? <Text style={styles.error}>{weightError}</Text> : null} </Text>
                <TextInput style={[styles.input3]} value={weight} onChangeText={setWeight} keyboardType="numeric"/>
            </View>
        </View>

        <View style={[styles.container3, { marginBottom: 20 }]}>
            <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={onSave}>
                <Text style={styles.text}> Create </Text>
            </Pressable>
        </View>
    </ScrollView>
    </Keyboard>
    );
};

export default CreateWeightLog;