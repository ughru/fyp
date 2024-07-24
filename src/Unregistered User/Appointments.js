import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Image, Platform, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import styles from '../components/styles';
import { storage } from '../../firebaseConfig';
import { AntDesign } from '@expo/vector-icons';
import ModalStyle from '../components/ModalStyle';
import axios from 'axios';
import url from '../components/config';

const { width: screenWidth } = Dimensions.get('window');

const Appointments = ({navigation}) => {
  const [imageUrl, setImageUrls] = useState(null); // ads display
  const [activeButton, setActiveButton] = useState('Upcoming');
  const [isModalVisible, setModalVisible] = useState(false);
  const [image, setImageUrl] = useState(null); // 404 not found display
  const [specialistAds, setSpecialistAds] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(`${url}/allSpecialistAds`);
        if (response.data.status === 'ok') {
          const images = response.data.specialistAds.map(ad => ad.imageUrl);
          setImageUrls(images);
          setSpecialistAds(response.data.specialistAds);
        } else {
          console.error('Error fetching images:', response.data.error);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    const fetchImage2 = async () => {
      try {
       const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
    fetchImage2();
  }, []);

  const handleCategoryButtonClick = (category) => {
    setActiveButton(category);
  };

  const toggleModal = () => { 
    setModalVisible(!isModalVisible);
  };
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container4 , Platform.OS!=="web"&&{paddingTop:50}]}>
        <Text style={[styles.pageTitle]}> Appointments</Text>

        <View style={[styles.adImageContainer, {
          ...Platform.select({
          web:{width:screenWidth*0.9, paddingTop:20, left: 20, paddingRight:10},
          default:{paddingTop:20, left: 20, paddingRight:10}
        }) }]}>
        {specialistAds.length > 0 && (
          <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20}}>
            {specialistAds.map((ad, index) => (
              <View key={index} style= {{marginBottom: 20}}>
              <TouchableOpacity style={{ width: 300, height: 200, marginBottom: 10 }}>
                {/* Image */}
                <View style={{ ...StyleSheet.absoluteFillObject }}>
                  <Image source={{ uri: ad.imageUrl  }}
                    style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'contain' }}/>
                </View>
              </TouchableOpacity>
              <Text style= {[styles.text, {alignSelf: 'center'}]}> {ad.title} by {ad.company}</Text>
              </View>
            ))}
          </ScrollView>
        )}
        </View>
      </View>

      <View style={[styles.container4, { marginBottom: 20}]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <AntDesign name="calendar" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={toggleModal}>
            <Text style={styles.questionText}>Book Appointment</Text>
          </Pressable>
        </View>

        <Text style={[styles.questionText, {marginBottom: 20}]}>Overview</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => handleCategoryButtonClick('Upcoming')}
            style={activeButton === 'Upcoming' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCategoryButtonClick("Completed")}
            style={activeButton === 'Completed' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCategoryButtonClick("Cancelled")}
            style={activeButton === 'Cancelled' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>Cancelled</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ModalStyle  isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />

      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        <Text style= {[styles.formText, {fontStyle: 'italic'}]}> Oops! Nothing here yet </Text>
      </View>
    </ScrollView>
  );
};

export default Appointments;