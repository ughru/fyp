import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { RichEditor } from 'react-native-pell-rich-editor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keyboard from '../components/Keyboard'; 
import url from '../components/config';
import { Feather, AntDesign } from '@expo/vector-icons';

// import own code
import styles from '../components/styles';

const UserCreatePost = ({ navigation }) => {
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
<<<<<<<< Updated upstream:src/Registered User/UserCreatePost.js
                    <Text style={[styles.pageTitle]}> Create Post </Text>
========
                    <AntDesign name="left" size={24} color="black" />
                        <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                            <Text style={styles.text}> back </Text>
                        </Pressable>
                    <Text style={[styles.pageTitle]}> Book Appointment </Text>
>>>>>>>> Stashed changes:src/Registered User/UserCreateAppointment.js
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                        <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                            <Entypo name="cross" size={30} color="black" />
                        </Pressable>
                    </View>
                </View>

                {/* Form fields */}
                <View style={[styles.container3, { marginBottom: 20 }]}>
                    <View style={{ marginBottom: 30 }}>
                        <Text style={[styles.text, { marginBottom: 10 }]}> Category {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null} </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <Pressable
                                onPress={() => handleCategoryButtonClick('General')}
                                style={activeButton === 'General' ? styles.categoryBtnActive : styles.categoryBtn}
                            >
                                <Text style={styles.text}> General </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleCategoryButtonClick('Ask Specialist')}
                                style={activeButton === 'Ask Specialist' ? styles.categoryBtnActive : styles.categoryBtn}
                            >
                                <Text style={styles.text}> Ask Specialist </Text>
                            </Pressable>
                        </View>

                        <View style={[styles.container3, { marginBottom: 20 }]}>
                        <Text style={[styles.text, { marginBottom: 20 }]}> Description {descriptionError ? <Text style={styles.error}>{descriptionError}</Text> : null} </Text>
                        <RichEditor
                            onChange={(newDescription) => setDescription(newDescription)}
                            initialContentHTML={description}
                        />
                    </View>

                    <View style={[styles.container3, { marginBottom: 20 }]}>
                        <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={onSavePost}>
                            <Text style={styles.text}> Create </Text>
                        </Pressable>
                    </View>
                    </View>
                </View>
            </ScrollView>
        </Keyboard>
    );
};

export default UserCreatePost;