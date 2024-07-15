import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Image, Platform, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import styles from '../components/styles';
import { storage } from '../../firebaseConfig';
import { AntDesign } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const UserAppointments = ({navigation}) => {
  const [imageUrl, setImageUrls] = useState(null); // ads display
  const [image, setImageUrl] = useState(null); // 404 not found display
  const [activeButton, setActiveButton] = useState('Upcoming');
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
          const storageRef = storage.ref('specialistAd');
          const images = await storageRef.listAll();

          // Get all image URLs or up to 5 if fewer
          const randomImages = [];
          const totalImages = Math.min(images.items.length, 5); // Limit to 5 or fewer images

          // Generate random indices without repetition
          const randomIndices = new Set();
          while (randomIndices.size < totalImages) {
              randomIndices.add(Math.floor(Math.random() * images.items.length));
          }

          for (let index of randomIndices) {
              const imageUrl = await images.items[index].getDownloadURL();
              randomImages.push(imageUrl);
          }

          setImageUrls(randomImages);
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
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container4 , Platform.OS!=="web"&&{paddingTop:50}]}>
        <Text style={[styles.pageTitle]}> Appointments</Text>

        <View style={[styles.adImageContainer, {
        ...Platform.select({
          web:{width:screenWidth*0.9, paddingTop:20, left: 20 , paddingRight:10},
          default:{paddingTop:20, paddingRight:10}
        }) }]}>
            <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20}}>
              {imageUrl && imageUrl.map((url, index) => ( 
                <TouchableOpacity
                  key={index}
                  style={{ width: 250, height: 200 }}>
                  {/* Image */}
                  <View style={{ ...StyleSheet.absoluteFillObject }}>
                    <Image
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'contain' }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
      </View>

      <View style={[styles.container4, {marginBottom: 20}]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <AntDesign name="calendar" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate('UserBookAppointment')}>
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

      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        <Text style= {[styles.formText, {fontStyle: 'italic'}]}> Oops! Nothing here yet </Text>
      </View>
    </ScrollView>
  );
};

export default UserAppointments;