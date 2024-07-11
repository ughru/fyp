import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Keyboard from '../components/Keyboard'; 
import url from '../components/config';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {storage} from '../../firebaseConfig';

// import own code
import styles from '../components/styles';

const SpecialistCreateAds = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState(null);

    const [titleError, setError1] = useState('');
    const [companyError, setError2] = useState('');
    const [descriptionError, setError3] = useState('');
    const [imageError, setError4] = useState('');
    const [descriptionHeight, setDescriptionHeight] = useState(0);

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

        fetchSpecialistInfo(); 

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
                    company,
                    description,
                    imageUrl
                };

                const response = await axios.post(`${url}/specialistCreateAd`, specialistAd);

                // Alert success and navigate back
                Alert.alert('Success', 'Ad successfully created!',
                    [{
                        text: 'OK', onPress: async () => {
                            navigation.goBack();
                        }
                    }],
                    { cancelable: false }
                );
            } catch (error) {
                console.error('Ad error:', error.message);

                // Alert failure
                Alert.alert('Failure', 'Ad was not created!',
                    [{ text: 'OK' }],
                    { cancelable: false }
                );
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
            Alert.alert('Error', 'Failed to pick an image.');
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
                Alert.alert('Error', 'Failed to take a photo.');
            }
        } else {
            Alert.alert('Permission denied', 'Camera permissions are required to take a photo.');
        }
    };

    const removeImage = () => {
        setImageUri(null);
    };

    return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
        <View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingBottom:20 }, {...Platform.select({web:{} , default:{paddingTop:50}})}]}>
            <Text style={[styles.pageTitle]}> Create Advertisements </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                    <Entypo name="cross" size={30} color="black" />
                </Pressable>
            </View>
        </View>

        {/* Form fields */}
        <View style={[styles.container4, { marginBottom: 20 }]}>
            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.text, { marginBottom: 10 }]}> Title {titleError ? <Text style={styles.error}>{titleError}</Text> : null} </Text>
                <TextInput style={[styles.input3]} value={title} onChangeText={setTitle} />
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
                    onContentSizeChange={(e) => setDescriptionHeight(e.nativeEvent.contentSize.height)}
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