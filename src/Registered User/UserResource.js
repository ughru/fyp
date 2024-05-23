import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather, Ionicons } from '@expo/vector-icons';
import url from '../components/config';

const UserResource = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRef = useRef([]);

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

  return (
    <Keyboard>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.pageTitle, { top: 80, left: 20 }]}>Resource Hub</Text>
        <View style={[styles.iconContainer, { top: 80, left: 330 }]}>
          <Feather name="download" size={24} color="black" />
        </View>

        {/* Search Bar */}
        <View style={[styles.search, { top: 150, left: 20 }]}>
          <View style={[styles.iconContainer, { left: 10 }]}>
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
        <View style={[styles.buttonContainer, { top: 190, left: 20 }]}>
          <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingVertical: 10, marginBottom: 10 }}>

            {categories.map((category, index) => (
              <TouchableOpacity key={index} ref={(el) => (itemRef.current[index] = el)}
                onPress={() => handleSelectCategory(index)}
                style={ activeIndex === index ? styles.categoryBtnActive : styles.categoryBtn }>
               <Text style={ activeIndex === index ? styles.categoryBtnTxtActive : styles.categoryBtnTxt }>
                  {category.categoryName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Resources */}
        <View style={[styles.buttonContainer, { top: 260, left: 20 }]}>
          <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, paddingVertical: 10 }}>
          {resources.map((resource, index) => (
            resource.category === categories[activeIndex]?.categoryName && (
              <TouchableOpacity key={index} style={styles.resourceBtn}>
                <Text> {resource.title} </Text>
              </TouchableOpacity>
            )
          ))}
          </ScrollView>
        </View>


      </ScrollView>
    </Keyboard>
  );
};

export default UserResource;