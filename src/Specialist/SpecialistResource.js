import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Pressable, Modal, TouchableHighlight, Alert, Image, StyleSheet, Platform } from 'react-native';
import axios from 'axios';
import styles from '../components/styles';
import { Feather, Ionicons, Entypo, MaterialIcons } from '@expo/vector-icons';
import url from '../components/config';
import Keyboard from '../components/Keyboard';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../../firebaseConfig'; 

const { width: screenWidth } = Dimensions.get('window');

const SpecialistResource = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRef = useRef([]);
  const [topHeight, setTopHeight] = useState(0);
  const [categoryError, setError1] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImageUrl] = useState(null);

  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const [specialistInfo, setSpecialistInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const fetchData = useCallback(async () => {
    try {
        const storedEmail = await AsyncStorage.getItem('user');
        if (storedEmail) {
            const [categoriesResponse, resourcesResponse, specialistInfoResponse] = await Promise.all([
                axios.get(`${url}/categories`),
                axios.get(`${url}/resource`),
                axios.get(`${url}/specialistinfo?email=${storedEmail}`)
            ]);
            setCategories(categoriesResponse.data);
            setResources(resourcesResponse.data.resources);
            setSpecialistInfo(specialistInfoResponse.data);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
  }, []);

  // useEffect to fetch data initially
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchData();
    fetchImage();
  }, [fetchData]);

  // useFocusEffect to fetch data when screen is focused
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

  const deleteResource = async (resourceID, imageUrl) => {
    try {
      await axios.delete(`${url}/deleteresource`, { params: { resourceID } });

      if (imageUrl) {
      const storageRef = storage.refFromURL(imageUrl);
      await storageRef.delete();
      }

      Alert.alert('Success', 'Resource deleted successfully');
      fetchData();
      setDropdownVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete resource');
      console.error('Error deleting resource:', error);
    }
  };

  const toggleDropdown = (resource) => {
    if (resource.specialistName === `${specialistInfo.firstName} ${specialistInfo.lastName}`) {
      setSelectedResource(resource);
      setDropdownVisible(!isDropdownVisible);
    }
  };

  const handleSelection = (action) => {
    if (action === 'edit') {
      navigation.navigate('UpdateResource', { resourceID: selectedResource.resourceID })
      setDropdownVisible(false);
    } else if (action === 'delete') {
      deleteResource(selectedResource.resourceID, selectedResource.imageUrl);
    } else {
      setDropdownVisible(false);
    }
  };

  const openModal = () => {
    setError1(''); // Reset category error 
    setModalVisible(true);
  };  

  const closeModal = () => {
    setModalVisible(false);
    setNewCategory('');
    fetchData();
    setSelectedCategory(null);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      setError1('* Required field');
      return;
  }

  // Check if the category already exists
  const categoryExists = categories.some(category => category.categoryName.toLowerCase() === newCategory.toLowerCase());
  if (categoryExists) {
    setError1('* Category already exists');
    return;
  }

  try {
    await axios.post(`${url}/addCategory`, { categoryName: newCategory });

    Alert.alert(
      'Category Added',
      'Category has been successfully added!',
      [{ text: 'OK', onPress: () => closeModal() }]
    );
  } catch (error) {
    console.error('Error adding category:', error);
  }
};  

  // Page Displays
  return (
    <Keyboard>
    <ScrollView style={styles.container3} contentContainerStyle={{...Platform.select({web:{} , default:{paddingTop:50}})}}>
      <View onLayout={onLayoutTop} style={[styles.container2, { paddingTop: 20, left: 20, width: screenWidth * 0.9 }]}>
        <Text style={[styles.pageTitle]}>Resource Hub</Text>
        <Pressable style={[styles.iconContainer]} onPress={() => navigation.navigate("CreateResource")}>
          <Feather name="edit" size={24} color="black" />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 20, left: 20}}>
        <Feather name="edit" size={24} color="black" />
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={openModal}>
            <Text style={styles.questionText}>Create Category</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.search, {right:10}]}>
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
          {categories.map((category, index) => (
              <TouchableOpacity
              key={index}
              ref={(el) => (itemRef.current[index] = el)}
              onPress={() => handleSelectCategory(index)}
              style={activeIndex === index ? styles.categoryBtnActive : styles.categoryBtn}
              >
              <Text style={activeIndex === index ? styles.categoryBtnTxt : styles.categoryBtnTxt}>
                  {category.categoryName}
              </Text>
              </TouchableOpacity>
          ))}
          </ScrollView>
      </View>

      {/* Resources */}
      <View style={[{ left: 20}, Platform.OS==="web"?{ width: screenWidth * 0.9}:{width:'100%'}]}>
        <ScrollView style={styles.container3}
        contentContainerStyle={Platform.OS==="web"? styles.resourceContainerWeb : styles.resourceContainerMobile}>
        {resources.map((resource, index) => {
        const activeCategory = categories[activeIndex]?.categoryName;
        const isSpecialistResource = resource.specialistName === `${specialistInfo.firstName} ${specialistInfo.lastName}`;

        if (activeCategory === "All" || resource.category === activeCategory) {
          return (
            <View key={index} style= {{marginBottom: 20}}>
            <TouchableOpacity
                key={index}
                style={[styles.resourceBtn , {marginRight:(screenWidth * 0.3 - 100)}]}
                onPress={() => navigation.navigate("SpecialistResourceInfo", { resourceID: resource.resourceID })}
            >

              {/* Image */}
              {resource.imageUrl && (
              <View style={{ ...StyleSheet.absoluteFillObject }}>
                <Image
                  source={{ uri: resource.imageUrl}}
                  style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' }}
                />
              </View>
              )}

              {/* More icon*/}
              {isSpecialistResource && (
                <TouchableHighlight style={[{ alignSelf: 'flex-end'}]} onPress={() => toggleDropdown(resource)}>
                    <Entypo name='dots-three-vertical' size={18} />
                </TouchableHighlight>
              )}

            </TouchableOpacity>
              <Text style= {[styles.text, {marginTop: 5, width: 100, textAlign: 'flex-start'}]}>
                    {resource.title} 
              </Text>
            </View>
          );
        }
        return null;
      })}
      </ScrollView>
    </View>

    {/* Resource Actions Modal */}
    <Modal
        transparent={true}
        animationType="fade"
        visible={isDropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={[styles.modalOverlay, {justifyContent: 'flex-end'}]}>
          <View style={{ width: '90%', backgroundColor: '#E3C2D7', borderRadius: 10, padding: 20, }}>
            <Pressable style= {{marginLeft: 280}} onPress={handleSelection}>
              <Feather name="x" size={24} color="black"/>
            </Pressable>
            {/* Selections */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Feather name="edit" size={22} color="black" />
              <Pressable style={{ marginLeft: 10 }} onPress = {() => handleSelection('edit')}>
                <Text style={styles.text}> Edit Resource </Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <MaterialIcons name="delete-outline" size={24} color="black" />
              <Pressable style={{ marginLeft: 10 }} onPress = {() => handleSelection('delete')}>
                <Text style={styles.text}> Delete Resource </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    {/* Category Modal */}
    <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={{width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10}}>
              <Text style={[styles.modalTitle]}>Create Category</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Feather name="x" size={24} color="black"/>
                </TouchableOpacity>
              </View>
              {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null}
              <TextInput
                style={{height: 40, padding: 10,borderRadius: 20, borderWidth: 1, borderColor: '#979595', marginBottom: 20}}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Category Name"
                placeholderTextColor="#979595"
              />
              <TouchableOpacity style={styles.button3} onPress={addCategory}>
                <Text style={styles.text}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </ScrollView>
    </Keyboard>
  ); 
};

export default SpecialistResource;