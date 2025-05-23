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

const showAlert = (title, message, onPress) => {
    if (Platform.OS === 'web') {
        // For web platform
        window.alert(`${title}\n${message}`);
        if (onPress) onPress();  // Execute the onPress callback for web
    } else {
        // For mobile platforms
        Alert.alert(title, message, [{ text: 'OK', onPress }], { cancelable: false });
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

const UserUpdatePost = ({ navigation, route }) => {
    // values
    const { postID } = route.params;
    const [description, setDescription] = useState('');

    const [categoryError, setError1] = useState('');
    const [descriptionError, setError2] = useState('');

    // set selected values
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeButton, setActiveButton] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [posts, setPosts] = useState(null);
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

        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${url}/getForumPosts`);
                const posts = response.data.forumPosts;

                // Find the post with the matching id
                const matchedPost = posts.find(res => res.postID === postID);
                if (matchedPost) {
                    setPosts(matchedPost); // Set post state
                    setSelectedCategory(matchedPost.category); // Set selected category state
                    setActiveButton(matchedPost.category);
                    setDescription(matchedPost.description); // Set description state
                } 
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPosts();
        fetchUserEmail();
    }, [postID]);

    const onSavePost = async () => {
        let valid = true;
    
        // Validate input fields
        if (!selectedCategory) {
            setError1('* Required field');
            valid = false;
        } else {
            setError1('');
        }
    
        if (!stripHTML(description).trim()) {
            setError2('* Required field');
            valid = false;
        } else {
            setError2('');
        }
    
        if (valid) {
            const postData = {
                postID: posts.postID, 
                userEmail: posts.userEmail,
                category: selectedCategory,
                description,
                dateUpdated: new Date(),
            };
    
            try {
                // Call your API to update the post
                await axios.put(`${url}/updatePost`, postData);
    
                // Alert success and navigate back
                showAlert('Success', 'Post successfully updated!', () => {
                    navigation.goBack();
                });
            } catch (error) {
                console.error('Post update error:', error.message);

                showAlert('Failure', 'Post was not updated!');
            }
        }
    };    

    const handleCategorySelection = (category) => {
        setSelectedCategory(category);
        setActiveButton(category);
    };   

    return (
        <Keyboard>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
                    <Text style={[styles.pageTitle]}> Update Post </Text>
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
                                onPress={() => handleCategorySelection('General')}
                                style={activeButton === 'General' ? styles.categoryBtnActive : styles.categoryBtn}
                            >
                                <Text style={styles.text}> General </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleCategorySelection('Ask Specialist')}
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
                                <Text style={styles.text}> Update </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Keyboard>
    );
};

export default UserUpdatePost;