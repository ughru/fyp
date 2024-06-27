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

// import own code
import styles from '../components/styles';

const CreateResource = ({ navigation }) => {
    // values
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [specialistInfo, setSpecialistInfo] = useState({ firstName: '', lastName: '' });
    const [imageUri, setImageUri] = useState(null);

    // errors
    const [titleError, setError1] = useState('');
    const [categoryError, setError2] = useState('');
    const [statusError, setError3] = useState('');
    const [descriptionError, setError4] = useState('');

    // set selected values
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedStatuses, setSelectedStatuses] = useState([]);

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
                console.error(error);
            }
        };

        fetchSpecialistInfo();
        fetchCategories();
    }, []);

    const handleStatusSelection = (status) => {
        setSelectedStatuses((prevStatuses) =>
            prevStatuses.includes(status)
                ? prevStatuses.filter((item) => item !== status)
                : [...prevStatuses, status]
        );
    };

    const onSaveResource = async () => {
        let valid = true;

        // Validate input fields
        if (!title.trim()) {
            setError1('* Required field');
            valid = false;
        } else {
            setError1('');
        }

        if (selectedCategory === 'Select a category') {
            setError2('* Required field');
            valid = false;
        } else {
            setError2('');
        }

        if (selectedStatuses.length === 0) {
            setError3('* Please select at least one status');
            valid = false;
        } else {
            setError3('');
        }

        if (!description.trim()) {
            setError4('* Required field');
            valid = false;
        } else {
            setError4('');
        }

        if (valid) {
            try {
                let imageUrl = '';

                if (imageUri) {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    const filename = `${title}.${blob.type.split('/')[1]}`;
                    const storageRef = storage.ref().child(`resource/${filename}`);
                    await storageRef.put(blob);
                    imageUrl = await storageRef.getDownloadURL();
                }

                const resourceData = {
                    title,
                    category: selectedCategory,
                    status: selectedStatuses,
                    description,
                    specialistName: `${specialistInfo.firstName} ${specialistInfo.lastName}`,
                    imageUrl
                };

                const response = await axios.post(`${url}/addresource`, resourceData);

                // Handle response and check if the resource already exists
                if (response.data && response.data.error === "Resource with the same title already exists!") {
                    setError1('* Resource with the same title already exists');
                    return;
                }

                // Alert success and navigate back
                Alert.alert('Success', 'Resource successfully created!',
                    [{
                        text: 'OK', onPress: async () => {
                            navigation.goBack();
                        }
                    }],
                    { cancelable: false }
                );
            } catch (error) {
                console.error('Resource error:', error.message);

                // Alert failure
                Alert.alert('Failure', 'Resource was not created!',
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
                aspect: [4, 3],
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
                    aspect: [4, 3],
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
            <Text style={[styles.pageTitle]}> Create Resource </Text>
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

            {/* Status selection buttons */}
            <View style={[styles.container4, { marginBottom: 20 }]}>
                <Text style={[styles.text, { marginBottom: 20 }]}> Status {statusError ? <Text style={styles.error}>{statusError}</Text> : null} </Text>
                <View style={[styles.buttonPosition]}>
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
                </View>
            </View>

            <View style={[styles.container4, { marginBottom: 20 }]}>
                <Text style={[styles.text, { marginBottom: 20 }]}> Description {descriptionError ? <Text style={styles.error}>{descriptionError}</Text> : null} </Text>
                <RichToolbar
                    editor={editor} 
                    actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.insertBulletsList,
                        actions.insertOrderedList, actions.heading1, actions.heading2]}
                    iconMap={{
                        [actions.setBold]: ({tintColor}) => <Text style={[{fontSize: 22, color: '#979595', color: tintColor}]}> B </Text>,
                        [actions.setItalic]: ({tintColor}) => <Text style={[{fontSize: 22, color: '#979595', color: tintColor}]}> I </Text>,
                        [actions.setUnderline]: ({tintColor}) => <Text style={[{fontSize: 22, color: '#979595', color: tintColor}]}> U </Text>,
                        [actions.heading1]: ({tintColor}) => <Text style={[{fontSize: 22, color: '#979595', color: tintColor}]}> H1 </Text>,
                        [actions.heading2]: ({tintColor}) => <Text style={[{fontSize: 22, color: '#979595', color: tintColor}]}> H2 </Text>
                    }}
                />
                <RichEditor
                    ref={editor} 
                    onChange={(newDescription) => setDescription(newDescription)}
                    initialContentHTML={description}
                />
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
            <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={onSaveResource}>
                <Text style={styles.text}> Create </Text>
            </Pressable>
        </View>
    </ScrollView>
    </Keyboard>
    );
};

export default CreateResource;