import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

// import own code
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import url from '../components/config';

const CreateResource = ({ navigation}) => {
    // values
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [specialistInfo, setSpecialistInfo] = useState({ firstName: '', lastName: '' });

    // errors
    const [titleError, setError1] = useState('');
    const [categoryError, setError2] = useState('');
    const [statusError, setError3] = useState('');
    const [descriptionError, setError4] = useState('');

    // set selected values
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedStatuses, setSelectedStatuses] = useState([]);

    // description
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isHeading, setIsHeading] = useState(false);
    const [isSubHeading, setIsSubHeading] = useState(false);
    const [resources, setResources] = useState([]);

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
        fetchResources();
    }, []);

    // Fetch resources from backend API
    const fetchResources = async () => {
        try {
        const response = await axios.get(`${url}/resource`);
        setResources(response.data);
        } catch (error) {
        console.error('Error fetching resources:', error);
        }
    };

    const handleStatusSelection = (status) => {
        setSelectedStatuses((prevStatuses) =>
            prevStatuses.includes(status)
                ? prevStatuses.filter((item) => item !== status)
                : [...prevStatuses, status]
        );
    };

    const applyBold = () => {
        setIsBold(!isBold);
        if (selectionStart === selectionEnd) {
            // No text is selected, no formatting
            return;
        }
    
        // Wrap the selected text with bold tags
        const updatedDescription =
            description.slice(0, selectionStart) +
            "<b>" +
            description.slice(selectionStart, selectionEnd) +
            "</b>" +
            description.slice(selectionEnd);
    
        setDescription(updatedDescription);
    };
    
    const applyItalic = () => {
        setIsItalic(!isItalic);
        if (selectionStart === selectionEnd) {
            // No text is selected, no formatting
            return;
        }
    
        // Wrap the selected text with italic tags
        const updatedDescription =
            description.slice(0, selectionStart) +
            "<i>" +
            description.slice(selectionStart, selectionEnd) +
            "</i>" +
            description.slice(selectionEnd);
    
        setDescription(updatedDescription);
    };        

    const applyHeading = () => {
        setIsHeading(!isHeading);
        if (selectionStart === selectionEnd) {
            // No text is selected, no formatting
            return;
        }
    
        // Wrap the selected text with heading tags
        const updatedDescription =
            description.slice(0, selectionStart) +
            "<h1>" +
            description.slice(selectionStart, selectionEnd) +
            "</h1>" +
            description.slice(selectionEnd);
    
        setDescription(updatedDescription);
    };
    
    const applySubHeading = () => {
        setIsSubHeading(!isSubHeading);
        if (selectionStart === selectionEnd) {
            // No text is selected, no formatting
            return;
        }
    
        // Wrap the selected text with subheading tags
        const updatedDescription =
            description.slice(0, selectionStart) +
            "<h2>" +
            description.slice(selectionStart, selectionEnd) +
            "</h2>" +
            description.slice(selectionEnd);
    
        setDescription(updatedDescription);
    };      
      
      const handleTextChange = (newText) => {
        setDescription(newText); // Update description state
    };
    
    
      const handleSelectionChange = ({ nativeEvent: { selection } }) => {
        setSelectionStart(selection.start);
        setSelectionEnd(selection.end);
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
            const resourceData = {
                title,
                category: selectedCategory,
                status: selectedStatuses,
                description,
                specialistName: `${specialistInfo.firstName} ${specialistInfo.lastName}`
            };

            try {
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

    return (
        <Keyboard>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', top: 50, marginBottom: 90 }}>
                    <Text style={[styles.pageTitle]}> Create Resource </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                        <Pressable style={[styles.formText, {}]} onPress={() => navigation.goBack()}>
                            <Entypo name="cross" size={30} color="black" />
                        </Pressable>
                    </View>
                </View>

                {/* Form fields */}
                <View style={[styles.container3, { marginBottom: 20 }]}>
                    <View style={{ marginBottom: 30 }}>
                        <Text style={[styles.text, { marginBottom: 10 }]}> Title {titleError ? <Text style={styles.error}>{titleError}</Text> : null} </Text>
                        <TextInput style={[styles.input3]} value={title} onChangeText={setTitle} />
                    </View>
                    <View style={{ marginBottom: 30 }}>
                        <Text style={[styles.text, { marginBottom: 10 }]}> Category {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null} </Text>
                        <RNPickerSelect
                            onValueChange={(value) => {
                            setSelectedCategory(value)}}
                            items={categories} 
                            style={styles.pickerSelectStyles}
                            placeholder={{ label: 'Select a category', value: 'Select a category'}}
                        />
                    </View>
                    
                    {/* Status selection buttons */}
                    <View style={[styles.container3, { marginBottom: 20 }]}>
                        <Text style={[styles.text, { marginBottom: 20 }]}> Status {statusError ? <Text style={styles.error}>{statusError}</Text> : null} </Text>
                        <View style={[styles.buttonPosition]}>
                            <Pressable
                                style={[
                                    styles.button6, {marginHorizontal: 10},
                                    selectedStatuses.includes('Pre') ? styles.button6 : styles.defaultButton,
                                ]}
                                onPress={() => handleStatusSelection('Pre')}
                            >
                                <Text>Pre</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.button6, {marginHorizontal: 10},
                                    selectedStatuses.includes('During') ? styles.button6 : styles.defaultButton,
                                ]}
                                onPress={() => handleStatusSelection('During')}
                            >
                                <Text>During</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.button6, {marginHorizontal: 10},
                                    selectedStatuses.includes('Post') ? styles.button6 : styles.defaultButton,
                                ]}
                                onPress={() => handleStatusSelection('Post')}
                            >
                                <Text>Post</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Description */}
                    <View style= {[styles.container3, {marginBottom: 20}]}>
                    <Text style={[styles.text, { marginBottom: 20 }]}> Description {descriptionError ? <Text style={styles.error}>{descriptionError}</Text> : null} </Text>
                        <View style={{ justifyContent: 'center', flexDirection: 'row', marginBottom: 20 }}>
                            <Pressable style={[styles.iconContainer, {marginHorizontal: 20}]} onPress={applyBold}>
                                <Text style={[styles.date, isBold ? [styles.questionText, {color: 'black'}] : null]}>B</Text>
                            </Pressable>
                            <Pressable style={[styles.iconContainer, {marginHorizontal: 20}]} onPress={applyItalic}>
                                <Text style={[styles.date, isItalic ? [styles.questionText, {color: 'black'}] : null]}>I</Text>
                            </Pressable>
                            <Pressable style={[styles.iconContainer, {marginHorizontal: 20}]} onPress={applyHeading}>
                                <Text style={[styles.date, isHeading ? [styles.questionText, {color: 'black'}] : null]}>H1</Text>
                            </Pressable>
                            <Pressable style={[styles.iconContainer, {marginHorizontal: 20}]} onPress={applySubHeading}>
                                <Text style={[styles.date, isSubHeading ? [styles.questionText, {color: 'black'}] : null]}>H2</Text>
                            </Pressable>
                        </View>
                        <TextInput
                            multiline
                            value={description} 
                            onChangeText={handleTextChange} 
                            onSelectionChange={handleSelectionChange}
                            style={{ minHeight: 50, borderWidth: 0.5, borderColor: '#979595', borderRadius: 20, padding: 5 }}
                        />

                    </View>

                    {/* Image Upload */}
                    <View style={{ marginBottom: 30 }}>
                        <Text style={[styles.text, { marginBottom: 10 }]}> Image </Text>
                        <Pressable style={[{ borderWidth: 1, width: 150, height: 30, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderColor: '#979595' }]}>
                            <Text style={styles.text}> Upload an image </Text>
                        </Pressable>
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