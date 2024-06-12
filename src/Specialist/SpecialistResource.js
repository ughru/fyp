import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Pressable, Modal, TouchableHighlight } from 'react-native';
import axios from 'axios';
import styles from '../components/styles';
import { Feather, Ionicons, Entypo, AntDesign, MaterialIcons } from '@expo/vector-icons';
import url from '../components/config';
import Keyboard from '../components/Keyboard';


const { width: screenWidth } = Dimensions.get('window');

const SpecialistResource = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRef = useRef([]);
  const [topHeight, setTopHeight] = useState(0);
  
  const [isDropdownVisible, setDropdownVisible] = useState(false);

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

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSelection = (action) => {
    // Perform action based on selection
    
    // Close the dropdown box
    setDropdownVisible(false);
  };

  // Page Displays
  return (
    <Keyboard>
    <ScrollView style={styles.container3} contentContainerStyle={{ paddingBottom: topHeight }}>
      <View onLayout={onLayoutTop} style={[styles.container2, { top: 75, left: 20, width: screenWidth * 0.9 }]}>
        <Text style={[styles.pageTitle]}>Resource Hub</Text>
        <Pressable style={[styles.iconContainer]} onPress={() => navigation.navigate("CreateResource")}>
          <Feather name="edit" size={24} color="black" />
        </Pressable>
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
                  onPress= {() => navigation.navigate("SpecialistResourceInfo", { title: resource.title })}
                >

                  <TouchableHighlight style={[styles.threeDotVert]} onPress={toggleDropdown}>
                    <Entypo name='dots-three-vertical' size={16} />
                  </TouchableHighlight>
                  <View style= {{flex: 1, justifyContent: 'flex-end'}}>
                    <Text style= {[styles.text]}>{resource.title}</Text>
                  </View>
                </TouchableOpacity>
              );
            }
            return null;
          })}
        </ScrollView>

        <Modal
                transparent={true}
                animationType="slide"
                visible={isDropdownVisible}
                onRequestClose={() => setDropdownVisible(false)}
              >
                <View style={[styles.modalOverlay, {justifyContent: 'flex-end'}]}>
                <View style={{ 
                    width: '90%',
                    backgroundColor: '#E3C2D7',
                    borderRadius: 10,
                    padding: 20,
                    }}>
                    <Pressable style= {{marginLeft: 280}} onPress={handleSelection}>
                      <Feather name="x" size={24} color="black"/>
                    </Pressable>
                    {/* Selections */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                      <Feather name="edit" size={22} color="black" />
                      <Pressable style={{ marginLeft: 10 }}>
                        <Text style={styles.text}> Edit Resource </Text>
                      </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <MaterialIcons name="delete-outline" size={24} color="black" />
                      <Pressable style={{ marginLeft: 10 }}>
                        <Text style={styles.text}> Delete Resource </Text>
                      </Pressable>
                    </View>
                </View>
                </View>
              </Modal>
      </View>
    </ScrollView>
    </Keyboard>
  );
};

export default SpecialistResource;