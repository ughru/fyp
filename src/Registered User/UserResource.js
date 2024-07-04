import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import styles from '../components/styles';
import { Feather, Ionicons } from '@expo/vector-icons';
import url from '../components/config';
import Keyboard from '../components/Keyboard';

const { width: screenWidth } = Dimensions.get('window');

const UserResource = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRef = useRef([]);
  const [topHeight, setTopHeight] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${url}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategories();

    // Fetch resources from backend API
    const fetchResources = async () => {
      try {
        const response = await axios.get(`${url}/resource`);
        setResources(response.data.resources);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    fetchResources();
  }, []);

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

  return (
    <Keyboard>
   <ScrollView style={styles.container3} contentContainerStyle={{...Platform.select({web:{} , default:{paddingTop:50}})}}>
      <View onLayout={onLayoutTop} style={[styles.container2, { paddingTop: 20, left: 20, width: screenWidth * 0.9 }]}>
        <Text style={[styles.pageTitle]}>Resource Hub</Text>
        <TouchableOpacity style={[styles.iconContainer]} onPress= {() => navigation.navigate("UserDownloads")}>
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
            if (activeCategory === "All" || resource.category === activeCategory) {
              return (
                <View key={index} style= {{marginBottom: 20}}>

                <TouchableOpacity
                  key={index}
                  style={[styles.resourceBtn , {marginRight:(screenWidth * 0.3 - 100)}]}
                  onPress= {() => navigation.navigate("UserResourceInfo", { resourceID: resource.resourceID })}
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
          })}
        </ScrollView>
      </View>
    </ScrollView>
    </Keyboard>
  );
};

export default UserResource;