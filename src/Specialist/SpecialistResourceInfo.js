import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import styles from '../components/styles';
import { AntDesign, Feather } from '@expo/vector-icons';
import url from '../components/config';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const SpecialistResourceInfo = ({navigation, route}) => {
  const { title } = route.params;
  const [resource, setResource] = useState([]);
  const [topHeight, setTopHeight] = useState(0);

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

  // Function to get the height of the top section
  const onLayoutTop = (event) => {
      const { height } = event.nativeEvent.layout;
      setTopHeight(height + 100);
  };

  return (
      <ScrollView style={styles.container3} contentContainerStyle={{ paddingBottom: topHeight }}>
          {/** Top section */}
          <View onLayout={onLayoutTop} style={{...styles.container2, top: 80, left: 20, width: screenWidth * 0.9}}>
              {/** Arrow + Back button */}
              <View style={{ flexDirection: 'row' , alignContent:'center'}}>
                  <View>
                      <AntDesign name="left" size={24} color="black" />
                  </View>
                  <Pressable onPress={() => navigation.goBack()}>
                      <Text style={[styles.text, {top: 3}]}> back</Text>
                  </Pressable>
              </View>
          </View>
          <View style={styles.container3}>
              {resource && (
              <View style={{ top: 90, left: 20 }}>
                  {/* Title */}
                  <Text style={[styles.pageTitle, { marginBottom: 20 }]}>{title}</Text>

                  {/* Category */}
                  <Pressable style={[styles.resourceCategoryButton, {marginBottom: 20}]}>
                      <Text style={[styles.categoryBtnTxt]}>{resource.category}</Text>
                  </Pressable>

                  {/* Description */}
                  <Text style={[styles.descriptionText, {  width: screenWidth * 0.9 }]}>{resource.description}</Text>
              </View>
              )}
          </View>
      </ScrollView>
  );
};

export default SpecialistResourceInfo;