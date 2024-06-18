import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import Keyboard from '../components/Keyboard';
import url from '../components/config';

// Import styles
import styles from '../components/styles';

const UpdateResource = ({ navigation, route }) => {
    // Values
    const { resourceID} = route.params;
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [specialistInfo, setSpecialistInfo] = useState({ firstName: '', lastName: '' });
    const [resource, setResource] = useState(null);

    // Errors
    const [titleError, setTitleError] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');

    // Selected values
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
                    setDescription(matchedResource.description); // Set description state
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

        if (!description.trim()) {
            setDescriptionError('* Required field');
            valid = false;
        } else {
            setDescriptionError('');
        }

        if (valid) {
            const resourceData = {
                resourceID: resourceID,
                title,
                category: selectedCategory,
                status: selectedStatuses,
                description,
                specialistName: `${specialistInfo.firstName} ${specialistInfo.lastName}`
            };

            try {
                await axios.put(`${url}/updateresource`, resourceData);

                // Alert success and navigate back
                Alert.alert('Success', 'Resource successfully updated!', [{ text: 'OK', onPress: () => navigation.goBack() }], {
                    cancelable: false
                });
            } catch (error) {
                console.error('Resource update error:', error);

                // Alert failure
                Alert.alert('Failure', 'Resource was not updated!', [{ text: 'OK' }], { cancelable: false });
            }
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
                        {statusError ? <Text style={styles.error}>{statusError}</Text> : null}
                    </View>

                    <View style={[styles.container4, { marginBottom: 20 }]}>
                        <Text style={[styles.text, { marginBottom: 20 }]}> Description </Text>
                        <RichToolbar
                            editor={editor}
                            actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.insertBulletsList,
                                actions.insertOrderedList, actions.heading1, actions.heading2]}
                            iconMap={{
                                [actions.setBold]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}> B </Text>,
                                [actions.setItalic]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}> I </Text>,
                                [actions.setUnderline]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}> U </Text>,
                               
                                [actions.insertBulletsList]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}> • </Text>,
                                [actions.insertOrderedList]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}> 1. </Text>,
                                [actions.heading1]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}> H1 </Text>,
                                [actions.heading2]: ({ tintColor }) => <Text style={[{ fontSize: 22, color: '#979595', color: tintColor }]}> H2 </Text>
                            }}
                        />
                        <RichEditor
                            ref={editor}
                            onChange={(newDescription) => setDescription(newDescription)}
                            initialContentHTML={description}
                        />
                        {descriptionError ? <Text style={styles.error}>{descriptionError}</Text> : null}
                    </View>

                    {/* Image Upload */}
                    <View>
                        <Text style={[styles.text, { marginBottom: 10 }]}> Image </Text>
                        <Pressable style={[{ borderWidth: 1, width: 150, height: 30, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderColor: '#979595' }]}>
                            <Text style={styles.text}> Upload an image </Text>
                        </Pressable>
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