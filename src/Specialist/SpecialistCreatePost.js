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

const showAlert = (title, message, onConfirm = () => {}) => {
    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n${message}`)) {
        onConfirm();
        } 
    } else {
        Alert.alert(title, message, [{ text: 'OK', onPress: onConfirm  }], { cancelable: false });
    }
};

function stripHTML(html) {
    // Create a temporary div element to use browser's HTML parser
    var div = document.createElement("div");
    div.innerHTML = html;

    // Get the text content from the div
    var text = div.textContent || div.innerText || "";

    // Normalize whitespace (replace multiple spaces with a single space and trim leading/trailing whitespace)
    return text.replace(/\s+/g, ' ').trim();
}

const SpecialistCreatePost = ({ navigation }) => {
    // values
    const [description, setDescription] = useState('');
    const [descriptionError, setError1] = useState('');

    // set selected values
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

        if (!stripHTML(description).trim()) {
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
                showAlert('Success', 'Post successfully created!', () => {
                    navigation.goBack();
                });
            } catch (error) {
                console.error('Post error:', error.message);

                // Alert failure
                showAlert('Failure', 'Post was not created!');
            }
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
                        <Text style={[styles.text, { marginBottom: 10 }]}> Category </Text>
                        
                        <View style={[styles.buttonContainer, { marginBottom: 20 }]}>
                            <View style= {styles.categoryBtnActive}>
                                <Text style={styles.text}> Ask Specialist </Text>
                            </View>
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

export default SpecialistCreatePost;