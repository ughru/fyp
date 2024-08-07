import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Keyboard from '../components/Keyboard'; 
import url from '../components/config';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {storage} from '../../firebaseConfig';
import RNPickerSelect from 'react-native-picker-select';

// import own code
import styles from '../components/styles';

const showAlert = (title, message, onPress) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message, [{ text: 'OK', onPress }], { cancelable: false });
    }
};

const SpecialistCreateAds = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState(null);

    const [titleError, setError1] = useState('');
    const [companyError, setError2] = useState('');
    const [descriptionError, setError3] = useState('');
    const [imageError, setError4] = useState('');
    const [descriptionHeight, setDescriptionHeight] = useState(0);
    const [categoryError, setError5] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [specialistInfo, setSpecialistInfo] = useState([]);

    useEffect(() => {
        const fetchSpecialistInfo = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('user');
                if (storedEmail) {
                    const response = await axios.get(`${url}/specialistinfo?email=${storedEmail}`);
                    if (response.data) {
                        const { email } = response.data;
                        setSpecialistInfo({ email });
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${url}/getAllAdCategories`);
                const categoryItems = response.data.map((category) => ({
                    label: category.categoryName,
                    value: category.categoryName,
                }));
                const filteredCategoryItems = categoryItems.slice(1);
                setCategories(filteredCategoryItems);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSpecialistInfo(); 
        fetchCategories();
    }, []);

    const onSaveAd = async () => {
        let valid = true;

        // Validate input fields
        if (!title.trim()) {
            setError1('* Required field');
            valid = false;
        } else if (title[0] !== title[0].toUpperCase()) {
            setError1('* First letter must be uppercase');
            valid = false;
        } else {
            setError1('');
        }

        if (selectedCategory === 'Select a category') {
            setError5('* Required field');
            valid = false;
        } else {
            setError5('');
        }

        if (!company.trim()) {
            setError2('* Required field');
            valid = false;
        } else {
            setError2('');
        }

        if (!description.trim()) {
            setError3('* Required field');
            valid = false;
        } else {
            setError3('');
        }

        if (!imageUri) {
            setError4('* Image is required');
            valid = false;
        }

        if (valid) {
            try {
                let imageUrl = '';

                if (imageUri) {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    const filename = `${title}.${blob.type.split('/')[1]}`;
                    const storageRef = storage.ref().child(`specialistAd/${filename}`);
                    await storageRef.put(blob);
                    imageUrl = await storageRef.getDownloadURL();
                }

                const specialistAd = {
                    userEmail: `${specialistInfo.email}`,
                    title,
                    category: selectedCategory,
                    company,
                    description,
                    imageUrl
                };

                const response = await axios.post(`${url}/specialistCreateAd`, specialistAd);

                // Alert success and navigate back
                showAlert('Success', 'Ad successfully created!', () => {
                    navigation.goBack();
                });
            } catch (error) {
                console.error('Ad error:', error.message);

                // Alert failure
                showAlert('Failure', 'Ad was not created!');
            }
        }
    }; 

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1,
                });

            if (!result.canceled) {
                // Set the selected image URI to the state
                setImageUri(result.assets[0].uri);
            } 
        } catch (error) {
            console.error('Error picking image:', error);
            showAlert('Error', 'Failed to pick an image.');
        }
    };

    const takePhoto = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === 'granted') {
            try {
                let result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 1,
                });

                if (!result.canceled) {
                    setImageUri(result.assets[0].uri);
                } 
            } catch (error) {
                console.error('Error taking photo:', error);
                showAlert('Error', 'Failed to take a photo.');
            }
        } else {
            showAlert('Permission denied', 'Camera permissions are required to take a photo.');
        }
    };

    const removeImage = () => {
        setImageUri(null);
    };

    const handleInputHeightChange = useCallback((height) => {
        setDescriptionHeight(prevState => ({
            ...prevState,
            description: height
        }));
    }, []);

    return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
        <View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingBottom:20 }, {...Platform.select({web:{} , default:{paddingTop:50}})}]}>
            <Text style={[styles.pageTitle]}> Create Service Ad </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                    <Entypo name="cross" size={30} color="black" />
                </Pressable>
            </View>
        </View>

        {/* Form fields */}
        <View style={[styles.container4, { marginBottom: 20 }]}>
            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.text, { marginBottom: 10 }]}> Service Title {titleError ? <Text style={styles.error}>{titleError}</Text> : null} </Text>
                <TextInput style={[styles.input3]} value={title} onChangeText={setTitle} />
            </View>

            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.text, { marginBottom: 10 }]}> Category {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null} </Text>
                <RNPickerSelect
                    onValueChange={(value) => {
                        setSelectedCategory(value)
                    }}
                    items={categories}
                    style={styles.pickerSelectStyles}
                    placeholder={{ label: 'Select a category', value: 'Select a category' }}
                />
            </View>

            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.text, { marginBottom: 10 }]}> Company {companyError ? <Text style={styles.error}>{companyError}</Text> : null} </Text>
                <TextInput style={[styles.input3]} value={company} onChangeText={setCompany} />
            </View>

            <View style={[styles.container4, { marginBottom: 20 }]}>
                <Text style={[styles.text, { marginBottom: 20 }]}> Description {descriptionError ? <Text style={styles.error}>{descriptionError}</Text> : null} </Text>
                <TextInput
                    style={[styles.input3, { height: Math.max(35, descriptionHeight + 20) }]} // Minimum height set to 35
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    onContentSizeChange={(contentSize) => handleInputHeightChange(contentSize.height)}
                />
            </View>

            {/* Image Upload */}
            <View>
                <Text style={[styles.text, { marginBottom: 10 }]}> Image {imageError ? <Text style={styles.error}>{imageError}</Text> : null} </Text>
                <Pressable style={[{width: '100%', height: 200, borderWidth: 1, borderRadius: 20, justifyContent: 'center', 
                            alignItems: 'center', borderColor: '#979595', marginBottom: 10, overflow: 'hidden'}]} onPress={pickImage}>
                    {!imageUri && (
                        <>
                        <Ionicons name="image-outline" size={32} color="black" />
                        <Text style={styles.text}> Upload an image </Text>
                        </>
                    )}
                    {imageUri && (
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: '100%', height: '100%', borderRadius: 20, resizeMode: 'cover' }}
                    />
                    )}
                </Pressable>
                <Pressable style={[styles.imageUpload,{marginBottom: 20}]} onPress={takePhoto}>
                    <Text style={styles.text}> Take a photo </Text>
                </Pressable>
                {imageUri && (
                <View>
                    <Pressable style={[styles.imageUpload]} onPress={removeImage}>
                        <Text style={styles.text}> Remove Image </Text>
                    </Pressable>
                </View>
                )}
            </View>
        </View>

        <View style={[styles.container3, { marginBottom: 20 }]}>
            <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress= {onSaveAd}>
                <Text style={styles.text}> Create </Text>
            </Pressable>
        </View>
    </ScrollView>
    </Keyboard>
    );  
};

export default SpecialistCreateAds;