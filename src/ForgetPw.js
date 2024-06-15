import React, {useState} from 'react';
import { Text, Pressable, TextInput, ScrollView, View } from 'react-native';
import styles from './components/styles';
import Keyboard from './components/Keyboard';
import axios from 'axios';
import url from "./components/config";
import { AntDesign } from '@expo/vector-icons';

const ForgetPw = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailError, setError1] = useState('');
    const [pwError, setError2] = useState('');

    navigation.addListener('focus', () => {
        setEmail('');
        setPassword('');
    });

    return (
        <Keyboard>
        <ScrollView contentContainerStyle={[styles.container]}>
        {/* Back Button */}
        <View style={[styles.container3, {justifyContent: 'center'}]}>
            <View style = {{ flexDirection: 'row', alignItems: 'center', bottom: 120 }}>
            <AntDesign name="left" size={24} color="black" />
            <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                <Text style={styles.text}> back </Text>
            </Pressable>
            </View>

        {/* Title */}
            <Text style={[styles.pageTitle,  { marginLeft: 10, marginBottom: 20 }]}> Forget Password </Text>
            <Text style= {[styles.titleNote, { marginLeft: 10, marginBottom: 40}]}> To reset, fill form below </Text>

        {/* Form */}
            <View style={{ marginBottom: 30, alignSelf: 'center' }}>
            <Text style= {[styles.formText, {marginBottom: 10}]}> Email   </Text>
            <TextInput style={[styles.input]} value = {email} onChangeText = {setEmail}
                keyboardType="email-address" />
            </View>

            <View style={{ marginBottom: 30, alignSelf: 'center' }}>
            <Text style= {[styles.formText, {marginBottom: 10}]}> New Password </Text>
            <TextInput style={[styles.input]} value = {password} onChangeText = {setPassword} secureTextEntry={true}/>
            </View>

            {/* Button */}
            <Pressable style={[styles.button, { marginBottom: 20, alignSelf: 'center' }]}>
            <Text style={styles.text}> Reset </Text>
            </Pressable>
        </View>
        </ScrollView>
        </Keyboard>
    );
};

export default ForgetPw;
