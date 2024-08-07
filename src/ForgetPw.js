import React, { useState } from 'react';
import { Text, Pressable, TextInput, ScrollView, View, Alert, Platform } from 'react-native';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import axios from 'axios';
import url from "./components/config";
import { AntDesign } from '@expo/vector-icons';

const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

const ForgetPw = ({ navigation, route }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailError, setError1] = useState('');
    const [pwError, setError2] = useState('');

    const { origin } = route.params;

    const resetPassword = async () => {
        let valid = true;

        if (!email.trim()) {
            setError1('* Required field');
            valid = false;
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError1('* Invalid email format');
            valid = false;
        }
        else {
            setError1('');
        }

        if (!password.trim()) {
            setError2('* Required field');
            valid = false;
        }
        else if (password.length < 6) {
            setError2('* Must be at least 6 characters');
            valid = false;
        }
        else {
            setError2('');
        }

        if (valid) {
            try {
                const response = await axios.post(`${url}/resetpassword`, { email, newPassword: password });

                if (response.data && response.data.error) {
                    setError1(response.data.error);
                    return;
                }

                // Display successful update
                navigation.goBack();
                showAlert('Password Reset', 'Password has been reset successfully!');
            } catch (error) {
                showAlert('Reset Error', 'Unable to reset password.');
            }
        }
    };

    return (
    <Keyboard>
    <ScrollView contentContainerStyle={[styles.container]}>
        {/* Back Button */}
        <View style={[styles.container3, Platform.OS !== "web" && { paddingTop: 50 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 150 }}>
                <AntDesign name="left" size={24} color="black" />
                <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                    <Text style={styles.text}> back </Text>
                </Pressable>
            </View>

            <View style={[styles.container3, { justifyContent: 'center' }]}>
                {/* Title */}
                <Text style={[styles.pageTitle, { marginBottom: 20 }]}>
                    {origin === 'Login' ? 'Forget Password' : 'Change Password'}
                </Text>
                <Text style={[styles.titleNote, { marginBottom: 40 }]}> To reset, fill form below </Text>

                {/* Form */}
                <View style={{ marginBottom: 30, alignSelf: 'center' }}>
                    <Text style={[styles.formText, { marginBottom: 10 }]}> Email {emailError ? <Text style={styles.error}>{emailError}</Text> : null} </Text>
                    <TextInput style={[styles.input]} value={email} onChangeText={setEmail}
                        keyboardType="email-address" />
                </View>

                <View style={{ marginBottom: 30, alignSelf: 'center' }}>
                    <Text style={[styles.formText, { marginBottom: 10 }]}> New Password {pwError ? <Text style={styles.error}>{pwError}</Text> : null} </Text>
                    <TextInput style={[styles.input]} value={password} onChangeText={setPassword} secureTextEntry={true} />
                </View>

                {/* Button */}
                <Pressable style={[styles.button, { marginBottom: 20, alignSelf: 'center' }]} onPress={resetPassword}>
                    <Text style={styles.text}> Reset </Text>
                </Pressable>
            </View>
        </View>
    </ScrollView>
    </Keyboard>
    );
};

export default ForgetPw;