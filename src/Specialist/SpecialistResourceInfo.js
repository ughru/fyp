import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Platform } from 'react-native';
import HTMLView from 'react-native-htmlview';
import styles from '../components/styles';
import { AntDesign } from '@expo/vector-icons';
import url from '../components/config';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const SpecialistResourceInfo = ({ navigation, route }) => {
    const { resourceID } = route.params;
    const [resource, setResource] = useState(null);
    const [topHeight, setTopHeight] = useState(0);

    useEffect(() => {
        // Fetch resource info from backend API
        const fetchResources = async () => {
            try {
                const response = await axios.get(`${url}/resource`);
                const resources = response.data.resources;

                // Find the resource with the matching title
                const matchedResource = resources.find(res => res.resourceID === resourceID);
                setResource(matchedResource);
            } catch (error) {
                console.error('Error fetching resources:', error);
            }
        };

        fetchResources();
    }, [resourceID]);

    // Function to get the height of the top section
    const onLayoutTop = (event) => {
        const { height } = event.nativeEvent.layout;
        setTopHeight(height + 100);
    };

    // sort to display in "Pre, During, Post" order
    const sortStatus = (statusArray) => {
        const order = ['Pre', 'During', 'Post'];
        return statusArray.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    };

    return (
        <ScrollView style={styles.container3} contentContainerStyle={{ ...Platform.select({web:{} , default:{paddingTop:50}}) }}>
            {/* Top section */}
            <View onLayout={onLayoutTop} style={{ ...styles.container2, paddingTop: 20, left: 20, width: screenWidth * 0.9 }}>
                {/* Arrow + Back button */}
                <View style={{ flexDirection: 'row', alignContent: 'center' }}>
                    <View>
                        <AntDesign name="left" size={24} color="black" />
                    </View>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={[styles.text, { top: 3 }]}> back</Text>
                    </Pressable>
                </View>
            </View>
           <View style={{...styles.container4 , padding:20}}>
                {resource && (
                    <View>
                        {/* Title */}
                        <Text style={[styles.pageTitle, { marginBottom: 20 }]}>{resource.title}</Text>

                        <Text style={[styles.titleNote, { marginBottom: 20 }]}>Written by: Dr {resource.specialistName}</Text>

                        {/* Category */}
                        <Pressable style={[styles.resourceCategoryButton, { marginBottom: 20 }]}>
                            <Text style={[styles.categoryBtnTxt]}>{resource.category}</Text>
                        </Pressable>

                        {/* Status */}
                        <View style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {resource.status && sortStatus(resource.status).map((status, index) => (
                                    <Pressable key={index} style={[styles.button9, { marginHorizontal: 5, marginBottom: 10 }]}>
                                        <Text>{status}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Week Number */}
                        {resource.category === 'Pregnancy Summary' && (
                        <View style={{ marginBottom: 20 }}>
                            <Text style= {styles.text3}> Week: {resource.weekNumber} </Text>
                        </View>
                        )}

                        {/* Description */}
                        <View style={[styles.container4]}>
                            <HTMLView 
                            stylesheet={{ div: styles.text, p: styles.text, li: styles.text, 
                            h1: {fontSize: 26, fontWeight: 'bold'}, h2:{fontSize: 24, fontWeight: 'bold'}, h3:{fontSize: 22, fontWeight: 'bold'} }} 
                            value={resource.description} />
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default SpecialistResourceInfo;