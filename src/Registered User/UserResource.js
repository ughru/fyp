import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
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
        setResources(response.data);
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
    <ScrollView style={styles.container3} contentContainerStyle={{ paddingBottom: topHeight }}>
      <View onLayout={onLayoutTop} style={[styles.container2, { top: 75, left: 20, width: screenWidth * 0.9 }]}>
        <Text style={[styles.pageTitle]}>Resource Hub</Text>
        <View style={[styles.iconContainer, {marginBottom: 0}]}>
          <Feather name="download" size={24} color="black" />
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.search, {top: 100, right: 10}]}>
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
      <View style={[styles.buttonContainer, { top: 120, left: 20 }]}>
        <ScrollView  ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingVertical: 10, marginBottom: 10, paddingRight: 30 }}>
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
      <View style={[{ top: 120, left: 20 }]}>
        <ScrollView style={styles.container3}
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 20,
            paddingVertical: 10,
            paddingBottom: topHeight,
          }}>
          {resources.map((resource, index) => {
            const activeCategory = categories[activeIndex]?.categoryName;
            if (activeCategory === "All" || resource.category === activeCategory) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.resourceBtn}
                  onPress= {() => navigation.navigate("UserResourceInfo", { title: resource.title })}
                >
                  <Text>{resource.title}</Text>
                </TouchableOpacity>
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