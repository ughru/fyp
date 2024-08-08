import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import Keyboard from '../components/Keyboard';
import url from '../components/config';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {storage} from '../../firebaseConfig';

// Import styles
import styles from '../components/styles';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const showAlert = (title, message, onPress) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message, [{ text: 'OK', onPress }], {
            cancelable: false
        });
    }
};

const UpdateResource = ({ navigation, route }) => {
    // Values
    const { resourceID} = route.params;
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [specialistInfo, setSpecialistInfo] = useState({ firstName: '', lastName: '' });
    const [resource, setResource] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [weekNumber, setWeekNumber] = useState('');
    const [bmi, setBmi] = useState('');

    // Errors
    const [titleError, setTitleError] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [weekError, setWeekError] = useState('');
    const [bmiError, setBmiError] = useState('');

    // Selected values
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedBmi, setSelectedBmi] = useState([]);
    const [oldTitle, setOldTitle] = useState('');

    const editor = useRef(null);

    useEffect(() => {
        const fetchSpecialistInfo = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('user');
                if (storedEmail) {
                    const response = await axios.get(`${url}/specialistinfo?email=${storedEmail}`);
                    if (response.data) {
                        setSpecialistInfo(response.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${url}/categories`);
                const categoryItems = response.data.map((category) => ({
                    label: category.categoryName,
                    value: category.categoryName,
                }));
                const filteredCategoryItems = categoryItems.slice(1);
                setCategories(filteredCategoryItems);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchResources = async () => {
            try {
                const response = await axios.get(`${url}/resource`);
                const resources = response.data.resources;

                // Find the resource with the matching title
                const matchedResource = resources.find(res => res.resourceID === resourceID);
                if (matchedResource) {
                    setResource(matchedResource); // Set resource state
                    setTitle(matchedResource.title); // Set title state
                    setSelectedCategory(matchedResource.category); // Set selected category state
                    setSelectedStatuses(matchedResource.status); // Set selected statuses state
                    setSelectedBmi(matchedResource.bmi || ''); // set selected bmi state
                    setDescription(matchedResource.description); // Set description state
                    setWeekNumber(matchedResource.weekNumber); // Set week number state
                    setImageUri(matchedResource.imageUrl);
                    setOldTitle(matchedResource.title);
                } 
            } catch (error) {
                console.error('Error fetching resources:', error);
            }
        };

        fetchResources();
        fetchSpecialistInfo();
        fetchCategories();
    }, [resourceID]);

    const handleStatusSelection = (status) => {
        setSelectedStatuses((prevStatuses) =>
            prevStatuses.includes(status)
                ? prevStatuses.filter((item) => item !== status)
                : [...prevStatuses, status]
        );
    };

    const handleBMI = (bmiType) => {
        setSelectedBmi((prevBmi) =>
            prevBmi.includes(bmiType)
                ? prevBmi.filter((item) => item !== bmiType)
                : [...prevBmi, bmiType]
        );
    };

    const onUpdateResource = async () => {
        let valid = true;

        // Validate input fields
        if (!title.trim()) {
            setTitleError('* Required field');
            valid = false;
        } else {
            setTitleError('');
        }

        if (selectedCategory === 'Select a category') {
            setCategoryError('* Required field');
            valid = false;
        } else {
            setCategoryError('');
        }

        if (selectedStatuses.length === 0) {
            setStatusError('* Please select at least one status');
            valid = false;
        } else {
            setStatusError('');
        }

        if (selectedCategory === 'Diet Recommendations' && selectedBmi.length === 0) {
            setBmiError('* Please select at least one');
            valid = false;
        }

        if (!description.trim()) {
            setDescriptionError('* Required field');
            valid = false;
        } else {
            setDescriptionError('');
        }

        if (!weekNumber.trim()) {
            setWeekError('* Required field');
            valid = false;
        } else {
            setWeekError('');
        }

        if (valid) {
            try {
                let imageUrl = resource.imageUrl;

                if (oldTitle !== title && resource.imageUrl) {
                    const oldStorageRef = storage.refFromURL(resource.imageUrl);
                    const oldImage = await oldStorageRef.getDownloadURL();
                    const response = await fetch(oldImage);
                    const blob = await response.blob();
    
                    const newFilename = `${title}.${blob.type.split('/')[1]}`;
                    const newStorageRef = storage.ref().child(`resource/${newFilename}`);
                    await newStorageRef.put(blob);
                    imageUrl = await newStorageRef.getDownloadURL();
    
                    // Delete the old image
                    await oldStorageRef.delete();
                }
                else {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    const filename = `${title}.${blob.type.split('/')[1]}`;
                    const storageRef = storage.ref().child(`resource/${filename}`);
                    await storageRef.put(blob);
                    imageUrl = await storageRef.getDownloadURL();
                }
    
                const resourceData = {
                    resourceID,
                    title,
                    category: selectedCategory,
                    status: selectedStatuses,
                    weekNumber,
                    description,
                    specialistName: `${specialistInfo.firstName} ${specialistInfo.lastName}`,
                    imageUrl,
                    ...(selectedCategory === 'Diet Recommendations' && { bmi: selectedBmi })
                };
    
                await axios.put(`${url}/updateresource`, resourceData);
    
                const title = 'Success';
                const message = 'Resource successfully updated!';
                // Alert success and navigate back
                showAlert('Success', 'Resource successfully updated!', () => navigation.goBack());
            } catch (error) {
                console.error('Resource update error:', error);
                const title = 'Failure';
                const message = 'Resource was not updated!';
    
                // Alert failure
                showAlert('Failure', 'Resource was not updated!', () => navigation.goBack());
            }
        }
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
    
            if (!result.canceled) {
                // Set the selected image URI to the state
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };
    
    const takePhoto = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === 'granted') {
            try {
                let result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                });
    
                if (!result.canceled) {
                    // Set the selected image URI to the state
                    setImageUri(result.assets[0].uri);
                }
            } catch (error) {
                console.error('Error taking photo:', error);
            }
        } else {
            showAlert('Permission denied', 'Camera permissions are required to take a photo.');
        }
    };    

    const removeImage = async () => {
        try {
            if (imageUri && resource.imageUrl) {
                // Delete the image from Firebase Storage
                const storageRef = storage.refFromURL(resource.imageUrl);
                await storageRef.delete();
                setImageUri(null);
            }
        } catch (error) {
            console.error('Error removing image:', error);
        }
    };

    return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
        <View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingBottom:20 }, {...Platform.select({web:{} , default:{paddingTop:50}})}]}>
            <Text style={[styles.pageTitle]}> Update Resource </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                    <Entypo name="cross" size={30} color="black" />
                </Pressable>
            </View>
        </View>

        {/* Form fields */}
        <View style={[styles.container4, { marginBottom: 20 }]}>
            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.text, { marginBottom: 10 }]}> Title </Text>
                <TextInput style={[styles.input3]} value={title} onChangeText={setTitle} /> 
                {titleError ? <Text style={styles.error}>{titleError}</Text> : null}
            </View>
            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.text, { marginBottom: 10 }]}> Category </Text>
                <RNPickerSelect
                    onValueChange={(value) => {
                        setSelectedCategory(value)
                    }}
                    items={categories}
                    style={styles.pickerSelectStyles}
                    placeholder={{ label: 'Select a category', value: 'Select a category' }}
                    value={selectedCategory}
                />
                {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null}
            </View>

            {/* Status selection buttons */}
            <View style={[styles.container4, { marginBottom: 20 }]}>
                <Text style={[styles.text, { marginBottom: 20 }]}> Status </Text>
                <View style={[styles.buttonPosition]}>
                {selectedCategory !== 'Pregnancy Summary' ? (
                    <>
                    <Pressable
                        style={[
                            styles.button6, { marginHorizontal: 10 },
                            selectedStatuses.includes('Pre') ? styles.button6 : styles.defaultButton,
                        ]}
                        onPress={() => handleStatusSelection('Pre')}
                    >
                        <Text>Pre</Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.button6, { marginHorizontal: 10 },
                            selectedStatuses.includes('During') ? styles.button6 : styles.defaultButton,
                        ]}
                        onPress={() => handleStatusSelection('During')}
                    >
                        <Text>During</Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.button6, { marginHorizontal: 10 },
                            selectedStatuses.includes('Post') ? styles.button6 : styles.defaultButton,
                        ]}
                        onPress={() => handleStatusSelection('Post')}
                    >
                        <Text>Post</Text>
                    </Pressable>
                    </>
                    ) : (
                        <Pressable style={[styles.button6, selectedStatuses.includes('During')]}>
                            <Text>During</Text>
                        </Pressable>
                    )}
                </View>
                {statusError ? <Text style={styles.error}>{statusError}</Text> : null}
            </View>

            {/* Week No View */}
            {selectedCategory === 'Pregnancy Summary' && (
                <View style={{ marginBottom: 30 }}>
                    <Text style={[styles.text, { marginBottom: 10 }]}> Week Number  {weekError ? <Text style={styles.error}>{weekError}</Text> : null}</Text>
                    <TextInput
                        style={[styles.input3]}
                        value={weekNumber}
                        onChangeText={setWeekNumber}
                        keyboardType="numeric"
                    />
                </View>
            )}

            {/* BMI Category */}
            {selectedCategory === 'Diet Recommendations' && (
                <View style={{ marginBottom: 20 }}>
                    <Text style={[styles.text, { marginBottom: 10 }]}> BMI {bmiError ? <Text style={styles.error}>{bmiError}</Text> : null} </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {['Underweight', 'Normal', 'Overweight', 'Obese'].map((bmi) => (
                            <Pressable key={bmi} onPress={() => handleBMI(bmi)} 
                            style={[styles.button3, selectedBmi.includes(bmi) ? styles.button3 : styles.defaultButton, {marginBottom: 10, marginRight: 10}]}>
                                <Text style={styles.text}>{bmi}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}

            <View style={[styles.container4, { marginBottom: 20 }]}>
                <Text style={[styles.text, { marginBottom: 20 }]}> Description </Text>
                {Platform.OS === 'web' ? (
                <div>
                    <ReactQuill value={description} onChange={(newDescription) => setDescription(newDescription)}/>
                </div>
                ) : (
                    <>
                        <RichToolbar
                            editor={editor}
                            actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.insertBulletsList,
                                actions.insertOrderedList, actions.heading1, actions.heading2]}
                            iconMap={{
                                [actions.setBold]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}>B</Text>,
                                [actions.setItalic]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}>I</Text>,
                                [actions.setUnderline]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}>U</Text>,
                                [actions.insertBulletsList]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}>•</Text>,
                                [actions.insertOrderedList]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}>1.</Text>,
                                [actions.heading1]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}>H1</Text>,
                                [actions.heading2]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}>H2</Text>
                            }}
                        />
                        <RichEditor
                            ref={editor}
                            onChange={(newDescription) => setDescription(newDescription)}
                            initialContentHTML={description}
                        />
                    </>
                )
            }
                {descriptionError ? <Text style={styles.error}>{descriptionError}</Text> : null}
            </View>

            {/* Image Upload */}
            <View>
                <Text style={[styles.text, { marginBottom: 10 }]}> Image </Text>
                <Pressable style={[styles.imageUpload, {marginBottom: 10}]} onPress={pickImage}>
                    <Text style={styles.text}> Upload an image </Text>
                </Pressable>
                <Pressable style={[styles.imageUpload,{marginBottom: 20}]} onPress={takePhoto}>
                    <Text style={styles.text}> Take a photo </Text>
                </Pressable>
                {imageUri && (
                <View>
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: 300, height: 300, resizeMode: 'contain' }}
                    />
                    <Pressable style={[styles.imageUpload, { marginTop: 20 }]} onPress={removeImage}>
                        <Text style={styles.text}> Remove Image </Text>
                    </Pressable>
                </View>
                )}
            </View>
        </View>

        <View style={[styles.container3, { marginBottom: 20 }]}>
            <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={onUpdateResource}>
                <Text style={styles.text}> Update </Text>
            </Pressable>
        </View>
    </ScrollView>
    </Keyboard>
    );
};

export default UpdateResource;