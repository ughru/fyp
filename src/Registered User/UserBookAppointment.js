import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import url from '../components/config';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

// import own code
import styles from '../components/styles';

const UserCreateAppointment = ({ navigation }) => {
    // values
    const [description, setDescription] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [specialisations, setSpecialisations] = useState(['']);
    const [specialists, setSpecialists] = useState([]);

    const [categoryError, setError1] = useState('');
    const [descriptionError, setError2] = useState('');

    // set selected values
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeButton, setActiveButton] = useState('');
    const [selectedSpecialist, setSelectedSpecialist] = useState(null);
    const scrollRef = useRef(null);

    const fetchSpecialisations = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/specialisations`);
            setSpecialisations(response.data);
        } catch (error) {
            console.error('Error fetching specialisations:', error);
        }
    }, []);

    const fetchSpecialists = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/specialistinfo`);
            setSpecialists(response.data.specialists);
        } catch (error) {
            console.error('Error fetching specialists:', error);
        }
    }, []);

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
        fetchSpecialisations();
        fetchSpecialists();
    }, [fetchSpecialisations, fetchSpecialists]);

    useFocusEffect(
        useCallback(() => {
            fetchSpecialisations();
            fetchSpecialists();
        }, [fetchSpecialisations, fetchSpecialists])
    );

    const handleCategoryButtonClick = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory(null);
            setActiveButton('');
        } else {
            setSelectedCategory(category);
            setActiveButton(category);
        }
    };

    const handleSpecialistClick = (specialist) => {
        setSelectedSpecialist(specialist);
    };

    const filteredSpecialists = specialists.filter(specialist => specialist.specialisation === selectedCategory);

    return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[styles.container3, { marginBottom: 20 }]}>
        {/* Specialist schedule view to select and book */}
        {selectedSpecialist ? (
        <View>
            <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }, Platform.OS !== "web" && { paddingTop: 50 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                    <AntDesign name="left" size={24} color="black" />
                    <Pressable style={[styles.formText]} onPress={() => setSelectedSpecialist(null)}>
                        <Text style={styles.text}> back </Text>
                    </Pressable>
                </View>
                <Text style={[styles.pageTitle]}> Book Appointment </Text>
            </View>

            <View style={{ marginBottom: 20, alignItems: 'center' }}>
                {/* Display selected specialist */}
                <Pressable style={{ marginTop: 10, width: '85%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10, marginBottom: 20 }}>
                    <Text style={[styles.text3, { marginBottom: 10 }]}>{selectedSpecialist.firstName} {selectedSpecialist.lastName}</Text>
                    <Text style={[styles.text, { marginBottom: 10 }]}>{selectedSpecialist.specialisation}</Text>
                    <Text style={[styles.text, { marginBottom: 10 }]}>{selectedSpecialist.email}</Text>
                </Pressable>
            </View>

            <Text style={[styles.questionText, { marginBottom: 20 }]}> Select Schedule </Text>

             {/* Legend Display */}
             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Pressable style={[styles.button8, { backgroundColor: '#C2D7E3', marginLeft: 10 }]} />
                <Text style={[styles.text]}>Available</Text>
                <Pressable style={[styles.button7, { marginLeft: 20 }]} />
                <Text style={[styles.text]}>Selected</Text>
            </View>

            <Calendar
                hideExtraDays={true}
                markingType={'custom'}
                firstDay={1}
                theme={{
                textSectionTitleColor: '#b6c1cd',
                dayTextColor: '#2d4150',
                selectedDotColor: '#ffffff',
                arrowColor: '#d470af',
                indicatorColor: '#E3C2D7',
                }}
                style= {{marginBottom: 30}}
            />
        </View>
    ) : (
        <View style={[styles.container3, { marginBottom: 20 }]}>
            <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }, Platform.OS !== "web" && { paddingTop: 50 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                    <AntDesign name="left" size={24} color="black" />
                    <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                        <Text style={styles.text}> back </Text>
                    </Pressable>
                </View>
                <Text style={[styles.pageTitle]}> Book Appointment </Text>
            </View>

            <View style={{ marginBottom: 20 }}>
                {/* Specialisation buttons */}
                <Text style={[styles.questionText, { marginBottom: 10 }]}> Service {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null} </Text>
                <Text style={[styles.formText, { marginBottom: 10 }]}> Select a service </Text>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={Platform.OS === 'web' ? { width: '100%' } : { width: '100%' }}
                    contentContainerStyle={[{ gap: 10, paddingVertical: 10 }, Platform.OS !== 'web' && { flexDirection: 'row', flexWrap: 'nowrap' }]}
                >
                    {specialisations.map((item, index) => (
                        <Pressable
                            key={index}
                            style={[styles.categoryBtn, activeButton === item.specialisationName ? styles.categoryBtnActive : null]}
                            onPress={() => handleCategoryButtonClick(item.specialisationName)}
                        >
                            <Text style={styles.text}>{item.specialisationName}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Display specialists of the category */}
            <Text style={[styles.questionText, { marginBottom: 10 }]}> Specialists </Text>
            {filteredSpecialists.map((specialist, index) => (
                <View key={index} style={{ marginBottom: 20, alignItems: 'center' }}>
                        <Pressable
                            style={{ marginTop: 10, width: '85%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 10 }}
                            onPress={() => handleSpecialistClick(specialist)}
                        >
                            <Text style={[styles.text3, { marginBottom: 10 }]}>{specialist.firstName} {specialist.lastName}</Text>
                            <Text style={[styles.text, { marginBottom: 10 }]}>{specialist.specialisation}</Text>
                        </Pressable>
                    </View>
                ))}
            </View>
        )}
        </View>
    </ScrollView>
    );
};

export default UserCreateAppointment;