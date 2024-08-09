import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keyboard from '../components/Keyboard'; 
import url from '../components/config';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

// import own code
import styles from '../components/styles';

//import ReactQuill from 'react-quill';
//import 'react-quill/dist/quill.snow.css';

const showAlert = (title, message, onConfirm = () => {}, onCancel = () => {}) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) {
        onConfirm();
      } else {
        onCancel();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', onPress: onCancel, style: 'cancel' },
        { text: 'OK', onPress: onConfirm }
      ]);
    }
  };

const UserCreatePost = ({ navigation }) => {
    // values
    const [description, setDescription] = useState('');

    const [categoryError, setError1] = useState('');
    const [descriptionError, setError2] = useState('');

    // set selected values
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeButton, setActiveButton] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const editor = useRef(null);

    let WebQuillEditor;
    
    if (Platform.OS === 'web') {
        WebQuillEditor = require('../components/WebQuillEditor').default;
    }

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
                showAlert('Success', 'Post successfully created!', () => {navigation.goBack();}
                );
            } catch (error) {
                console.error('Post error:', error.message);

                showAlert('Failure', 'Post was not created!');
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
                    <Text style={[styles.pageTitle]}> Create Post </Text>
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

                        <View style={[styles.container3, { marginBottom: 50 }]}>
                        <Text style={[styles.text, { marginBottom: 20 }]}> Description {descriptionError ? <Text style={styles.error}>{descriptionError}</Text> : null} </Text>
                        {Platform.OS === 'web' ? (
                        <div>
                            <WebQuillEditor value={description} onChange={(newDescription) => setDescription(newDescription)}/>
                        </div>
                        ) : (
                        <>
                        <RichEditor
                            ref={editor} 
                            onChange={(newDescription) => setDescription(newDescription)}
                            initialContentHTML={description}
                        />
                        </>
                        )
                        }
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