import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform, StyleSheet, Image} from 'react-native';
import axios from 'axios';
import styles from '../components/styles';
import { Feather, Ionicons } from '@expo/vector-icons';
import url from '../components/config';
import Keyboard from '../components/Keyboard';
import ModalStyle from '../components/ModalStyle';
import { storage } from '../../firebaseConfig'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

const Resource = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRef = useRef([]);
  const [topHeight, setTopHeight] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [image, setImageUrl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [categoriesResponse, resourcesResponse, storedStatus] = await Promise.all([
        axios.get(`${url}/categories`),
        axios.get(`${url}/resource`),
        await AsyncStorage.getItem('selectedStatus')
      ]);
      setCategories(categoriesResponse.data);
      setResources(resourcesResponse.data.resources);
      setSelectedStatus(storedStatus);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };
    
    fetchImage();
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
        fetchData();
    }, [fetchData])
  );

  const handleSelectCategory = (index) => {
    const selected = itemRef.current[index];
    setActiveIndex(index);

    selected?.measure((x) => {
      scrollRef.current?.scrollTo({ x: x, y: 0, animated: true });
    });
  };

  const onLayoutTop = (event) => {
    const { height } = event.nativeEvent.layout;
    setTopHeight(height + 100);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const filteredResources = resources.filter(resource => {
    const activeCategory = categories[activeIndex]?.categoryName;
    const matchesCategory = activeCategory === "All" || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(search.toLowerCase());
    
    // Check user status and filter Pregnancy Summary resources accordingly
    if (selectedStatus === "Pre" || selectedStatus === "Post") {
      return matchesCategory && matchesSearch && resource.category !== "Pregnancy Summary";
    } else {
      return matchesCategory && matchesSearch;
    }
  });

  const filteredCategories = selectedStatus === "During" ? categories : categories.filter(category => category.categoryName !== "Pregnancy Summary");
  
  return (
    <Keyboard>
    <ScrollView style={styles.container3} contentContainerStyle={{...Platform.select({web:{} , default:{paddingTop:50}})}}>
      <View onLayout={onLayoutTop} style={[styles.container2, { paddingTop: 20, left: 20, width: screenWidth * 0.9 }]}>
        <Text style={[styles.pageTitle]}>Resource Hub</Text>
        <TouchableOpacity style={[styles.iconContainer]} onPress= {toggleModal}>
          <Feather name="download" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.search, {paddingTop: 20 , right:10}]}>
        <View style={[styles.iconContainer, {left: 40}]}>
          <Ionicons name="search-outline" size={24} color="black" />
        </View>
        <TextInput
          style={[styles.input3, styles.textInputWithIcon]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor="black"
        />
      </View>

      {/* Dynamic Navigation Buttons */}
      <View style={[styles.buttonContainer, {
        ...Platform.select({
          web:{width:screenWidth*0.9, paddingTop:20, left: 20 , paddingRight:10},
          default:{paddingTop:20, left: 20 , paddingRight:10}
        }) }]}>
        <ScrollView  ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
              style={Platform.OS === 'web'? {width:'100%'}:{width:screenWidth * 0.9}}
              contentContainerStyle={[{ gap: 10, paddingVertical: 10, marginBottom: 10 }, Platform.OS!=='web' && {paddingRight:10}]}>
          {filteredCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              ref={(el) => (itemRef.current[index] = el)}
              onPress={() => handleSelectCategory(index)}
              style={activeIndex === index ? styles.categoryBtnActive : styles.categoryBtn}
            >
              <Text style={styles.text}> {category.categoryName}  </Text>
            </TouchableOpacity>
         ))}
        </ScrollView>
      </View>

      {/* Resources */}
      <View style={[{ marginLeft: 20}, Platform.OS==="web"?{ width: screenWidth * 0.9}:{width:'100%'}]}>
        <ScrollView style={styles.container3}
          contentContainerStyle={Platform.OS==="web"? styles.resourceContainerWeb : styles.resourceContainerMobile}>
          {filteredResources.length > 0 ? filteredResources.map((resource, index) => {
            const activeCategory = categories[activeIndex]?.categoryName;
            if (activeCategory === "All" || resource.category === activeCategory) {
              return (
                <View key={index} style= {{marginBottom: 20}}>
                
                <TouchableOpacity
                  key={index}
                  style={[styles.resourceBtn , {marginRight:(screenWidth * 0.3 - 100)}]}
                  onPress={toggleModal}
                >

                {/* Image */}
                <View style={{ ...StyleSheet.absoluteFillObject }}>
                  <Image
                    source={{ uri: resource.imageUrl}}
                    style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' }}
                  />
                </View>

                </TouchableOpacity>
                <Text style= {[styles.text, {marginTop: 5, width: 100, textAlign: 'flex-start'}]}>
                  {resource.title} 
                </Text>
                </View>
              );
              }
              return null;
            }) : (
              <View style={{ marginLeft: 80, alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
                {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                <Text style= {[styles.formText, {fontStyle: 'italic'}]}> Oops! Nothing here yet </Text>
              </View>
            )}
        </ScrollView>
      </View>

      <ModalStyle  isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
    </ScrollView>
    </Keyboard>
  );
};

export default Resource;