import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform, StyleSheet, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import styles from '../components/styles';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import url from '../components/config';
import Keyboard from '../components/Keyboard';
import { storage } from '../../firebaseConfig'; 

const { width: screenWidth } = Dimensions.get('window');

const showAlert = (title, message, onConfirm = () => {}, onCancel = () => {}) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', onPress: onCancel}
    ]);
  }
};

const AdminResource = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRef = useRef([]);
  const [topHeight, setTopHeight] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryError, setError1] = useState('');
  const [image, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [categoriesResponse, resourcesResponse] = await Promise.all([
          axios.get(`${url}/categories`),
          axios.get(`${url}/resource`)
        ]);
        setCategories(categoriesResponse.data);
        setResources(resourcesResponse.data.resources);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      try {
        const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      } finally {
        setLoading(false); 
      }
    };

    fetchImage();
    fetchData();
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

  const openModal = () => {
    setError1(''); // Reset category error 
    setModalVisible(true);
  };  

  const closeModal = () => {
    setModalVisible(false);
    setNewCategory('');
    setSelectedCategory(null);
  };

  const openManageModal = () => {
    setModal2Visible(true);
  };

  const closeManageModal = () => {
    setModal2Visible(false);
  };

  const openModal3 = (category) => {
    setNewCategory(category);
    setSelectedCategory(category);
    setModal3Visible(true);
    closeManageModal();
  };

  const closeModal3 = () => {
    setModal3Visible(false);
    openManageModal();
  };

  // add category function
  const addCategory = async () => {
    let valid = true;

    if (!newCategory.trim()) {
      setError1('* Required field');
      valid = false;
    }  else if (newCategory[0] !== newCategory[0].toUpperCase()) {
      setError1('* First letter must be caps');
      valid = false;
    } else if (!/^[a-zA-Z ]+$/.test(newCategory)) {
      setError1('* Invalid category');
      valid = false;
    } else {
      setError1('');
    }
  
    // Check if the category already exists
    const categoryExists = categories.some(category => category.categoryName.toLowerCase() === newCategory.toLowerCase());
    if (categoryExists) {
      setError1('* Category already exists');
      valid = false;
    }
    
    if (valid) {
      try {
        await axios.post(`${url}/addCategory`, { categoryName: newCategory });
  
        showAlert(
          'Category Added',
          'Category has been successfully added!',
          () => closeModal()
        );
        fetchData();
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };  

  // update category function
  const updateCategory = async () => {
    let valid = true;
  
    // Validation checks
    if (!newCategory.trim()) {
      setError1('* Required field');
      valid = false;
    } else if (newCategory[0] !== newCategory[0].toUpperCase()) {
      setError1('* First letter must be caps');
      valid = false;
    } else if (!/^[a-zA-Z ]+$/.test(newCategory)) {
      setError1('* Invalid category');
      valid = false;
    } else {
      setError1('');
    }
  
    // If validation passes, attempt to update category
    if (valid) {
      try {
        const response = await axios.put(`${url}/updateCategory`, {
          oldCategoryName: selectedCategory,
          newCategoryName: newCategory.trim() // Trim to ensure no leading/trailing spaces
        });
  
        // Check response status and handle accordingly
        if (response.status === 200) {
          showAlert(
            'Category Updated',
            'Category has been successfully updated!',
            () => closeModal3()
          );
  
          // Fetch updated data after successful update
          fetchData();
        } else {
          console.error('Failed to update category:', response.data);
          // Handle error scenario, e.g., display error message
        }
      } catch (error) {
        console.error('Error updating category:', error);
        // Handle network or server errors
      }
    }
  };

  const extractWeekNumber = (title) => {
    const match = title.match(/Week (\d+)(?:-(\d+))?/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : start;
      return { start, end };
    }
    return { start: 0, end: 0 };
  };
  
  const filteredResources = resources.filter(resource => {
    const activeCategory = categories[activeIndex]?.categoryName;
    const matchesCategory = activeCategory === "All" || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
    })
  .sort((a, b) => {
    if (a.category === "Pregnancy Summary" && b.category === "Pregnancy Summary") {
      const weekA = extractWeekNumber(a.title);
      const weekB = extractWeekNumber(b.title);

      // Sorting by start week, and if equal, sort by end week
      if (weekA.start === weekB.start) {
        return weekA.end - weekB.end;
      }
      return weekA.start - weekB.start;
    }
    return 0; // Maintain original order for non-Pregnancy Summary resources
  });

  // display all categories without "All"
  const filteredCategories = categories.filter(category => category.categoryName !== "All");

  const handleEditCategory = (category) => {
    setNewCategory(category);
    setSelectedCategory(category);
    openModal3(category); 
  };

  // delete category function
  const handleDeleteCategory = async (categoryName) => {
    // Show confirmation dialog
    showAlert(
      'Confirm Delete',
      `Are you sure you want to delete the category "${categoryName}"?`,
      async () => {
        try {
          const holderCategory = 'Uncategorized'; // Define your holder category name

          // Check if the holder category exists
          const holderCategoryExists = categories.some(category => category.categoryName === holderCategory);

          // Create the holder category if it doesn't exist
          if (!holderCategoryExists) {
            await axios.post(`${url}/addCategory`, { categoryName: holderCategory });
          }

          // Filter resources under the category to be deleted
          const resourcesToMove = resources.filter(resource => resource.category === categoryName);

          // Update each resource's category
          for (const resource of resourcesToMove) {
            await axios.put(`${url}/updateresource`, {
              resourceID: resource.resourceID,
              title: resource.title,
              category: holderCategory,
              status: resource.status,
              weekNumber: resource.weekNumber,
              description: resource.description,
              specialistName: resource.specialistName,
              imageUrl: resource.imageUrl,
              bmi: resource.bmi
            });
          }

          // Proceed with category deletion
          await axios.delete(`${url}/deleteCategory`, { data: { categoryName } });

          // Update state to remove the deleted category and reflect moved resources
          setCategories(categories.filter(category => category.categoryName !== categoryName));
          setResources(resources.map(resource => 
            resource.category === categoryName 
              ? { ...resource, category: holderCategory } 
              : resource
          ));
            
          // Show success message
          showAlert('Success', 'Category deleted successfully');
          fetchData();
        } catch (error) {
          console.error('Error deleting category:', error);
          // Show error message
          showAlert('Error', 'Failed to delete category.');
        }
      },
      () => {
        // No action needed for cancel, this is just to satisfy the onCancel parameter
      }
    );
  };

  return (
  <Keyboard>
    <ScrollView style={styles.container3} contentContainerStyle={{...Platform.select({web:{} , default:{paddingTop:50}})}}>
      <View onLayout={onLayoutTop} style={[styles.container2, { paddingTop: 20, left: 20, width: screenWidth * 0.9 }]}>
        <Text style={[styles.pageTitle]}>Resource Hub</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 20, left: 20}}>
        <Feather name="edit" size={24} color="black" />
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={openModal}>
            <Text style={styles.questionText}>Create Category</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, left: 20}}>
        <MaterialIcons name="category" size={24} color="black" />
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={openManageModal}>
            <Text style={styles.questionText}>Manage Category</Text>
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
      {loading ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Text>Loading...</Text>
          <ActivityIndicator size="large" color="#E3C2D7" />
        </View>
      ) : (
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
                  onPress= {() => navigation.navigate("SpecialistResourceInfo", { resourceID: resource.resourceID })}
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
      )}
      </View>

      {/* Add Category Modal */}
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

        {/* Manage Category Modal */}
        <Modal
          visible={modal2Visible}
          animationType="fade"
          transparent={true}
          onRequestClose={closeManageModal}
        >
           <View style={styles.modalOverlay}>
            <View style={{width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10}}>
                <Text style={[styles.modalTitle]}>Manage Category</Text>
                <TouchableOpacity onPress={closeManageModal}>
                  <Feather name="x" size={24} color="black"/>
                </TouchableOpacity>
              </View>

              <ScrollView>
                {/* Display Category and functions */}
                {filteredCategories.map((category, index) => (
                  <View key={index} style={{ flexDirection: 'row', width: '100%', marginBottom: 10}}>
                    <Text style={[styles.text, {flex: 1, marginBottom: 20}]}>{category.categoryName}</Text>
                    <TouchableOpacity style= {{marginRight: 10}} onPress={() => handleEditCategory(category.categoryName)} >
                      <Feather name="edit" size={22} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCategory(category.categoryName)}>
                      <MaterialIcons name="delete" size={24} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Update Category Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modal3Visible}
          onRequestClose={closeModal3}
        >
          <View style={styles.modalOverlay}>
            <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                <Text style={[styles.modalTitle]}>Update Category</Text>
                <TouchableOpacity onPress={closeModal3}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>
              {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null}
              <TextInput
                style={{ height: 40, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: '#979595', marginBottom: 20 }}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Category Name"
                placeholderTextColor="#979595"
              />
              <TouchableOpacity style={styles.button3} onPress={updateCategory}>
                <Text style={styles.text}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  </ScrollView>
  </Keyboard>
  );
};

export default AdminResource;