import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Image, Platform, TouchableOpacity } from 'react-native';
import styles from '../components/styles';
import { storage } from '../../firebaseConfig';
import { AntDesign, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const SpecialistAppointments = ({navigation}) => {
  const [image, setImageUrl] = useState(null); // 404 not found display
  const [activeButton, setActiveButton] = useState('Upcoming');

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

  const handleCategoryButtonClick = (category) => {
    setActiveButton(category);
  };
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container4 , Platform.OS!=="web"&&{paddingTop:50}]}>
        <Text style={[styles.pageTitle]}> Appointments</Text>
      </View>

      <View style={[styles.container4, { marginBottom: 20}]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
          <AntDesign name="calendar" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }}>
            <Text style={styles.questionText}>Create Appointment</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <MaterialCommunityIcons name="timetable" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }}>
            <Text style={styles.questionText}>View Schedule</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <FontAwesome5 name="ad" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate("SpecialistAdvertisements")}>
            <Text style={styles.questionText}>Advertisements</Text>
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

export default SpecialistAppointments;