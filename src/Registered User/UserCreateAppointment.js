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

const UserCreateAppointment = ({ navigation }) => {
    // values
    const [description, setDescription] = useState('');

    const [categoryError, setError1] = useState('');
    const [descriptionError, setError2] = useState('');

    // set selected values
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeButton, setActiveButton] = useState('');
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

        // Validate input fields
        if (!selectedCategory) {
            setError1('* Required field');
            valid = false;
        } else {
            setError1('');
        }

        if (!description.trim()) {
            setError2('* Required field');
            valid = false;
        } else {
            setError2('');
        }

        if (valid) {
            const postData = {
                userEmail,
                category: selectedCategory,
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

    const handleCategoryButtonClick = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory(null);
            setActiveButton('');
        } else {
            setSelectedCategory(category);
            setActiveButton(category);
        }
    };

    return (
        <Keyboard>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
                    <Text style={[styles.pageTitle]}> Book Appointment </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                        <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                            <Entypo name="cross" size={30} color="black" />
                        </Pressable>
                    </View>
                </View>

                {/* Form fields */}
                <View style={[styles.container3, { marginBottom: 20 }]}>
                    <View style={{ marginBottom: 30 }}>
                        <Text style={[styles.textTitle, { marginBottom: 10 }]}> Service {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null} </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, justifyContent: 'space-evenly' }}>
                            <Pressable
                                onPress={() => handleCategoryButtonClick('Pregnancy')}
                                style={activeButton === 'Pregnancy' ? styles.categoryBtnActive : styles.categoryBtn}
                            >
                                <Text style={styles.text}> Pregnancy </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleCategoryButtonClick('Fertility')}
                                style={activeButton === 'Fertility' ? styles.categoryBtnActive : styles.categoryBtn}
                            >
                                <Text style={styles.text}> Fertility </Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => handleCategoryButtonClick('Nutrition')}
                                style={activeButton === 'Nutrition' ? styles.categoryBtnActive : styles.categoryBtn}
                            >
                                <Text style={styles.text}> Nutrition </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Show options for diff specialists */}
                <View style={styles.appointmentContainer}>
                  <Pressable
                    onPress={() => navigation.navigate("UserBookAppointment")}
                  >
                    <View style={styles.appointmentContainer2}>
                      <Text style={styles.appointmentText}>Dr Chua</Text>
                      <Text style={styles.appointmentText2}>Obstetrician</Text>
                      <View style={styles.appointmentContainer3}>
                        <Text style={styles.appointmentText2}>Hospital/Clinic</Text>
                        <Text style={styles.appointmentText3}>Details</Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("UserBookAppointment")}
                  >
                    <View style={styles.appointmentContainer2}>
                      <Text style={styles.appointmentText}>Dr 1</Text>
                      <Text style={styles.appointmentText2}>Obstetrician</Text>
                      <View style={styles.appointmentContainer3}>
                        <Text style={styles.appointmentText2}>Hospital/Clinic</Text>
                        <Text style={styles.appointmentText3}>Details</Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("UserBookAppointment")}
                  >
                    <View style={styles.appointmentContainer2}>
                      <Text style={styles.appointmentText}>Dr 2</Text>
                      <Text style={styles.appointmentText2}>Obstetrician</Text>
                      <View style={styles.appointmentContainer3}>
                        <Text style={styles.appointmentText2}>Hospital/Clinic</Text>
                        <Text style={styles.appointmentText3}>Details</Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("UserBookAppointment")}
                  >
                    <View style={styles.appointmentContainer2}>
                      <Text style={styles.appointmentText}>Dr 3</Text>
                      <Text style={styles.appointmentText2}>Obstetrician</Text>
                      <View style={styles.appointmentContainer3}>
                        <Text style={styles.appointmentText2}>Hospital/Clinic</Text>
                        <Text style={styles.appointmentText3}>Details</Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
            </ScrollView>
        </Keyboard>
    );
};

export default UserCreateAppointment;