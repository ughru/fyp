import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, ScrollView, Dimensions} from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { AntDesign, Feather } from '@expo/vector-icons';
import url from '../components/config';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const ResourceInfo = ({ navigation, route }) => {
    const { title } = route.params;
    const [resource, setResource] = useState([]);

    useEffect(() => {
    // Fetch resource info from backend API
    const fetchResources = async () => {
        try {
          const response = await axios.get(`${url}/resource`);
          const resources = response.data;
  
          // Find the resource with the matching title
          const matchedResource = resources.find(res => res.title === title);
          setResource(matchedResource);
        } catch (error) {
          console.error('Error fetching resources:', error);
        }
      };
  
      fetchResources();
    }, [title]);

    return (
        <Keyboard>
        <ScrollView contentContainerStyle={styles.container}>
            <View style={[styles.iconContainer, { top: 85, left: 20}]}>
            <AntDesign name="left" size={24} color="black" />
            </View>
            <Pressable style={[styles.formText, { top: 88, left: 45 }]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}>back</Text>
            </Pressable>
            <View style={[styles.iconContainer, { top: 85, left: 330 }]}>
                <Feather name="download" size={24} color="black" />
            </View>

            {resource && (
            <View style={[styles.resourceInfo, { top: 120, left: 20}]}>
                {/* Title */}
                <Text style={[styles.pageTitle, {marginBottom: 20}]}>{title}</Text>
                
                {/* Category */}
                <Pressable style = {[styles.resourceCategoryButton, { top: 50 }]}>
                    <Text style={[styles.categoryBtnTxt]}>{resource.category}</Text>
                </Pressable>
                
                {/* Description */}
                <Text style={[styles.descriptionText, { top: 100, width: screenWidth * 0.9}]}>{resource.description}</Text>
            </View>
            )}
        </ScrollView>
        </Keyboard>
    );
};

export default ResourceInfo;
