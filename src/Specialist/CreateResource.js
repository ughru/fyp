import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Entypo } from '@expo/vector-icons';
import url from '../components/config';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';

const CreateResource = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [titleError, setError1] = useState('');
    const [categoryError, setError2] = useState('');
    const [descriptionError, setError3] = useState('');

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [description, setDescription] = useState('');
    const [descriptionHeight, setDescriptionHeight] = useState(40); // Initial height

    const onDescriptionChange = (text) => {
        setDescription(text);
        if (text === '') {
            setDescriptionHeight(40); // Reset height to default when text is empty
        } else {
            // Calculate height based on the number of lines
            const numberOfLines = text.split('\n').length;
            setDescriptionHeight(40 + numberOfLines * 20); // Adjust height as needed
        }
    };
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${url}/categories`);
                const categoryItems = response.data.map((category) => ({
                    label: category.categoryName,
                    value: category._id,
                }));
                // Exclude the first item
                const filteredCategoryItems = categoryItems.slice(1);
                setCategories(filteredCategoryItems);
            } catch (error) {
                console.error(error);
            }
        };

        fetchCategories();
    }, []);

    const onSaveResource = async () => {
        let valid = true; 
    
        try {
            // Handle title Errors
            if (!title.trim()) {
                // Check if empty
                setError1('* Required field');
                valid = false;
            }
            else {
                setError1('');
            }

            // Handle category Errors
            if (!selectedCategory) {
                // Check if empty
                setError2('* Required field');
                valid = false;
            }
            else {
                setError2('');
            }

            // Handle description Errors
            if (!description.trim()) {
                // Check if empty
                setError3('* Required field');
                valid = false;
            }
            else {
                setError3('');
            }

            if (valid) {
                
                // Navigate to the home screen
                navigation.navigate("SpecialistResource");
            }
        } catch (error) {
          console.error('Resource error: Not saved');
        }
    };

    // Page Displays
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
            <View style={[styles.container3, {marginBottom: 20}]}>
                <View style={{ marginBottom: 30 }}>
                    <Text style={[styles.text, { marginBottom: 10 }]}> Title {titleError ? <Text style={styles.error}>{titleError}</Text> : null} </Text>
                    <TextInput style={[styles.input3]} value={title} onChangeText={setTitle} />
                </View>
                <View style={{ marginBottom: 30 }}>
                    <Text style={[styles.text, { marginBottom: 10 }]}> Category {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null} </Text>
                    <RNPickerSelect
                        onValueChange={(value) => setSelectedCategory(value)}
                        items={categories} // Use filtered categories here
                        style={styles.pickerSelectStyles}
                        placeholder={{ label: 'Select a category', value: null }}
                    />
                </View>
                <View style={{ marginBottom: 30 }}>
                    <Text style={[styles.text, { marginBottom: 10 }]}> Description {descriptionError ? <Text style={styles.error}>{descriptionError}</Text> : null} </Text>
                    <TextInput
                        style={[styles.input3, { height: Math.max(40, descriptionHeight) }]}
                        value={description}
                        onChangeText={onDescriptionChange}
                        multiline
                    />
                </View>
            </View>

            <View style={[styles.container3, {marginBottom: 20}]}>
            <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress = {onSaveResource}>
                <Text style={styles.text}> Create </Text>
            </Pressable>
            </View>
        </ScrollView>
        </Keyboard>
    )
};

export default CreateResource;