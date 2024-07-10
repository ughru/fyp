import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { RichEditor } from 'react-native-pell-rich-editor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keyboard from '../components/Keyboard'; 
import url from '../components/config';
import { Feather, AntDesign, Ionicons } from '@expo/vector-icons';

// import own code
import styles from '../components/styles';
import { TouchableHighlight } from 'react-native-web';

const SpecialistCreateAd = ({ navigation }) => {
    // values
    const [description, setDescription] = useState('');
    const [descriptionError, setError1] = useState('');

    // set selected values
    const [userEmail, setUserEmail] = useState('');

    // Fetch user email
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('user');
                if (storedEmail) {
                    setUserEmail(storedEmail);
                }
            } catch (error) {
                console.error('Error fetching user email:', error);
            }
        };

        fetchUserEmail();
    }, []);

    const onSavePost = async () => {
        let valid = true;

        if (!description.trim()) {
            setError1('* Required field');
            valid = false;
        } else {
            setError1('');
        }

        if (valid) {
            const postData = {
                userEmail,
                category: "Ask Specialist",
                description,
            };

            try {
                // Call your API to save the post
                await axios.post(`${url}/createForumPost`, postData);

                // Alert success and navigate back
                Alert.alert('Success', 'Post successfully created!',
                    [{
                        text: 'OK', onPress: async () => {
                            navigation.goBack();
                        }
                    }],
                    { cancelable: false }
                );
            } catch (error) {
                console.error('Post error:', error.message);

                // Alert failure
                Alert.alert('Failure', 'Post was not created!',
                    [{ text: 'OK' }],
                    { cancelable: false }
                );
            }
        }
    };

    return (
        <Keyboard>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
                    <Text style={styles.pageTitle}>Create Advertisement</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                        <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                            <Entypo name="cross" size={30} color="black" />
                        </Pressable>
                    </View>
                </View>

                <View style={[styles.appointmentContainer3, {paddingBottom: 20}]}>
                    <View style={[styles.appointmentCircle2, {width: 50, height: 50, borderRadius: 50}]}/>
                    <Text style={[styles.appointmentText5, {paddingTop: 25, paddingLeft: 20}]}>Dr Chua</Text>
                </View>

                <Text style={styles.appointmentText5}>Service Title</Text>
                <Text style={[styles.appointmentText5, {color: 'grey', marginBottom: 30}]}>Description</Text>

                <View style={{alignItems: 'center'}}>
                    <View style={{borderWidth: 1, width: 300, height: 150, borderRadius: 30, borderStyle: 'dashed', alignItems: 'center'}}>
                        <Pressable style={{marginTop: 40}}>
                            <AntDesign name='upload' size={30}/>
                        </Pressable>

                        <Pressable style={{paddingTop: 30}}>
                            <Text style={{color: 'grey'}}>Upload Picture</Text>
                        </Pressable>
                    </View>
                </View>

                <View>
                    <Pressable style={[styles.button, {marginTop: 30}]}>
                        <Text style={styles.text}>Upload</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </Keyboard>
    );
};

export default SpecialistCreateAd;