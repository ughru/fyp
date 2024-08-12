import React, {useState, useEffect, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, ScrollView, Platform, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import styles from '../components/styles';
import { AntDesign, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import url from '../components/config';
import {storage} from '../../firebaseConfig';
import RNPickerSelect from 'react-native-picker-select';

const SpecialistAdvertisements = ({navigation}) => {
  const [specialistAds, setSpecialistAds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [specialistInfo, setSpecialistInfo] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      // For web platform
      window.alert(`${title}\n${message}`);
    } else {
      // For mobile platforms
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  };
  
  const fetchSpecialistAds = async () => {
    try {
      const response = await axios.get(`${url}/getSpecialistAds`);
      if (response.data) {
        const adsWithSpecialistInfo = await Promise.all(
          response.data.map(async (ad) => {
            const specialistInfo = await fetchSpecialistInfo(ad.userEmail);
            return {
              ...ad,
              specialistName: specialistInfo && `${specialistInfo.firstName} ${specialistInfo.lastName}`,
            };
          })
        );
        setSpecialistAds(adsWithSpecialistInfo);
      } else {
        showAlert('Error', 'No ads found');
      }
    } catch (error) {
      console.error('Error fetching specialist ads:', error);
    }
  };

  const fetchSpecialistInfo = async (email) => {
    try {
      const response = await axios.get(`${url}/specialistinfo`, { params: { email } });
      if (response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching specialist info:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
       const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${url}/getAllAdCategories`);
        if (response.data) {
          setCategories(response.data);
        } else {
          showAlert('Error', 'No categories found');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchImage();
    fetchCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSpecialistAds();
    }, [])
  );

  const handleDeleteAd = async (adId, imageUrl) => {
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to delete this ad?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this ad?',
            [
              { text: 'Cancel', onPress: () => resolve(false) },
              { text: 'Delete', onPress: () => resolve(true) }
            ]
          );
        });
  
    if (confirmDelete) {
      try {
        // Delete the ad from the server
        const response = await axios.delete(`${url}/deleteSpecialistAd?adID=${adId}`);
  
        if (response.data.status === 'ok') {
          // Delete associated image from Firebase Storage if imageUrl exists
          if (imageUrl) {
            const storageRef = storage.refFromURL(imageUrl);
            await storageRef.delete();
          }
  
          showAlert('Success', 'Ad deleted successfully');
          fetchSpecialistAds(); // Refresh the list
        } else {
          showAlert('Error', 'Failed to delete ad');
        }
      } catch (error) {
        console.error('Error deleting ad:', error);
        showAlert('Error', 'Failed to delete ad');
      }
    }
  };

  const renderSpecialistAds = () => {
    // Filter ads based on the selected category
    const filteredAds = selectedCategory === 'All'
      ? specialistAds
      : specialistAds.filter(ad => ad.category && ad.category === selectedCategory);
  
    if (filteredAds.length > 0) {
      return (
        <View>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#E3C2D7', marginBottom: 20 }}>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>Specialist</Text>
            <Text style={{ flex: 1, marginLeft: 20, fontWeight: 'bold' }}>Service Title</Text>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>Company</Text>
            <Text style={{ width: 50, fontWeight: 'bold' }}></Text>
          </View>
  
          {/* List of Specialist Advertisements */}
          {filteredAds.map((ad, index) => (
            <View key={index} style={{ width: '100%', borderWidth: 2, borderColor: '#E3C2D7', borderRadius: 20, padding: 15, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10 }}>
                <Text style={{ flex: 1 }}>{ad.specialistName}</Text>
                <Text style={{ flex: 1, marginLeft: 20 }}>{ad.title}</Text>
                <Text style={{ flex: 1 }}>{ad.company}</Text>
                <TouchableOpacity style={{ width: 50, alignItems: 'flex-end'}} onPress={() => handleDeleteAd(ad.adID, ad.imageUrl)}>
                  <MaterialIcons name="delete" size={22} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ alignItems: 'flex-end', marginTop: 10 }} onPress={() => openModal(ad)}>
                <Text style={styles.formText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    } else {
      // Display an image when filteredAds is empty
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 150 }}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200, marginBottom: 20 }} />}
          <Text style={[styles.formText, { fontStyle: 'italic' }]}>Oops! No Ads Yet</Text>
        </View>
      );
    }
  };

  const openModal = (ad) => {
  setSelectedAd(ad);
  setModalVisible(true);
  };

  const closeModal = () => {
  setModalVisible(false);
  setSelectedAd(null);
  };

  const AdModal = () => {
    return (
    <Modal
    animationType="fade"
    transparent={true}
    visible={modalVisible}
    onRequestClose={closeModal}
    >
      <View style= {styles.modalOverlay}>
        <View style={{width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20}}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20}}>
        <Text style={[styles.modalTitle]}>{selectedAd?.title}</Text>
            <TouchableOpacity onPress={closeModal}>
            <Feather name="x" size={24} color="black"/>
            </TouchableOpacity>
        </View>
        <ScrollView style= {styles.container5}>
            <Text style= {[styles.text, {marginBottom: 10}]}>Created by: {selectedAd?.specialistName}</Text>
            <Text style= {[styles.text, {marginBottom: 10}]}>Category: {selectedAd?.category}</Text>
            <Text style= {[styles.text, {marginBottom: 10}]}>Company: {selectedAd?.company}</Text>
            <Text style= {[styles.text, {marginBottom: 10}]}>Description: {selectedAd?.description}</Text>
            <Image source={{ uri: selectedAd?.imageUrl }} style={{ aspectRatio: 16/9, resizeMode: 'cover', width: '100%', marginBottom: 10 }} />
        </ScrollView>
        </View>
      </View>
    </Modal>
    );
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Page Displays
  return (
  <ScrollView contentContainerStyle={styles.container}>
   <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }, Platform.OS !== "web" && { paddingTop: 50 }]}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>

          <Text style={[styles.pageTitle, { marginLeft: 60}]}> Services </Text>

          <Pressable style={[styles.iconContainer, {flex: 1, alignItems: 'flex-end'}]} onPress={() => navigation.navigate("SpecialistCreateAds")}>
            <Feather name="edit" size={24} color="black" />
          </Pressable>
        </View>
    </View>

     {/* Sort section */}
     <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
        <Text style={[styles.text, { marginRight: 10 }]}>Filter by:</Text>
        <RNPickerSelect
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          items={[
            { label: 'All', value: 'All' },
            ...categories.map(category => ({ label: category.categoryName, value: category.categoryName }))
          ]}
          style={{
          inputIOS: styles.text,
          inputAndroid: styles.text,
          inputWeb: styles.text,
        }}
        />
        {Platform.OS !== 'web' && 
          <View style={[styles.iconContainer, { marginLeft: 10 }]}>
          <AntDesign name="down" size={16} color="black" />
        </View>
        }
      </View>

    <ScrollView style={{ marginTop: 20 }}>
      {renderSpecialistAds()}
    </ScrollView>

    <AdModal />
  </ScrollView>
  )
};

export default SpecialistAdvertisements;