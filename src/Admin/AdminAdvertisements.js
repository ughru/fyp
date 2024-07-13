import React, {useState, useEffect, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, ScrollView, Platform, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import styles from '../components/styles';
import { AntDesign, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import url from '../components/config';
import {storage} from '../../firebaseConfig';

const AdminAdvertisements = ({navigation}) => {
  const [adminAds, setAdminAds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [activeButton, setActiveButton] = useState('Events');

  const fetchAdminAds = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('user');

      if (storedEmail) {
        const response = await axios.get(`${url}/getAdminAds`, { params: { userEmail: storedEmail } });
      if (response.data) {
        setAdminAds(response.data); 
      }
      } else {
        Alert.alert('Error', 'No email found in storage');
      }
    } catch (error) {
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

    fetchImage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAdminAds();
    }, [])
  );

  const handleButtonClick = (type) => {
    setActiveButton(type);
  };

  const handleDeleteAd = async (adId, imageUrl) => {
    // Confirm deletion with user
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this ad?',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // Delete the ad from the server
              const response = await axios.delete(`${url}/deleteAd?adID=${adId}`);
          
              if (response.data.status === 'ok') {
                // Delete associated image from Firebase Storage if imageUrl exists
                if (imageUrl) {
                  const storageRef = storage.refFromURL(imageUrl);
                  await storageRef.delete();
                }
                
                Alert.alert('Success', 'Ad deleted successfully', [
                  { text: 'OK', onPress: () => fetchAdminAds() } // Refresh list 
                ]);
              } else {
                Alert.alert('Error', 'Failed to delete ad');
              }
            } catch (error) {
              // Handle errors appropriately
              console.error('Error deleting ad:', error);
              Alert.alert('Error', 'Failed to delete ad');
            }
          }
        }
      ]
    );
  };  

  const renderAdminAds = () => {
    const filteredAds = adminAds.filter(ad => ad.type === activeButton);

    if (filteredAds.length > 0) {
    return (
      <View>
        {/* Header Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#E3C2D7' }}>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>Admin </Text>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>Title</Text>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>Company </Text>
          <Text style={{ width: 25, fontWeight: 'bold' }}> </Text>
          <Text style={{ width: 25, fontWeight: 'bold' }}> </Text>
        </View>

        {/* List of Admin Advertisements */}
        {adminAds.map((ad, index) => (
          <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderWidth: 1, borderColor: '#ddd' }}>
            <Text style={{ flex: 1 }}>{ad.userEmail}</Text>
            <Text style={{ flex: 1 }}>{ad.title}</Text>
            <Text style={{ flex: 1 }}>{ad.company}</Text>
            <TouchableOpacity style={{ width: 25, marginRight: 5}} onPress={() => openModal(ad)}>
              <Ionicons name="eye-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 25, alignItems: 'flex-end'}}  onPress={() => handleDeleteAd(ad.adID, ad.imageUrl)}>
              <MaterialIcons name="delete" size={22} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  } else {
    // Display an image when allData is empty
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 150 }}>
           {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200, marginBottom: 20 }} />}
           <Text style= {[styles.formText, {fontStyle: 'italic'}]}> Oops! No Ads Yet </Text>
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
              <Text style= {[styles.text, {marginBottom: 10}]}>Created by: {selectedAd?.userEmail}</Text>
              <Text style= {[styles.text, {marginBottom: 10}]}>Company: {selectedAd?.company}</Text>
              <Text style= {[styles.text, {marginBottom: 10}]}>Description: {selectedAd?.description}</Text>
              <Image source={{ uri: selectedAd?.imageUrl }} style={{ aspectRatio: 16/9, resizeMode: 'cover', width: '100%', marginBottom: 10 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
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

          <Text style={[styles.pageTitle, { marginLeft: 20}]}> Advertisements </Text>

          <Pressable style={[styles.iconContainer, {flex: 1, alignItems: 'flex-end'}]} onPress={() => navigation.navigate("CreateAds")}>
            <Feather name="edit" size={24} color="black" />
          </Pressable>
        </View>
    </View>

    {/* Type Filter Buttons */}
    <View style={[styles.buttonContainer]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20 }}>
        <TouchableOpacity
            onPress={() => handleButtonClick('Events')}
            style={activeButton === 'Events' ? styles.categoryBtnActive : styles.categoryBtn}
        >
            <Text style={styles.text}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => handleButtonClick('Products')}
            style={activeButton === 'Products' ? styles.categoryBtnActive : styles.categoryBtn}
        >
            <Text style={styles.text}>Products</Text>
        </TouchableOpacity>
      </View>
    </View>

    <ScrollView style={{ marginTop: 20 }}>
      {renderAdminAds()}
    </ScrollView>

    <AdModal />
  </ScrollView>
  )
};

export default AdminAdvertisements;