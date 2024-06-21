<<<<<<< Updated upstream
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
=======
import React, { act, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform, Image, TouchableOpacity } from 'react-native';
>>>>>>> Stashed changes
import styles from '../components/styles';
import { firebase } from '../../firebaseConfig';
import { Feather, AntDesign } from '@expo/vector-icons';

const Appointments = ({navigation}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [activeButton, setActiveButton] = useState('Upcoming');

  useEffect(() => {
    const fetchImage = async() => {
      try{
        const url = await firebase.storage().ref('adminAd/ad.png').getDownloadURL();
        setImageUrl(url);
      } catch(error){
        console.error('Error fetching image', error);
      }
    };

    fetchImage();
  }, []);

  const handleCategoryButtonClick = (category) => {
    setActiveButton(category);
  };
 
  // Page Displays
  return (
<<<<<<< Updated upstream
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container3, {top: 50}]}>
        <Text style={[styles.pageTitle, {marginBottom: 570, marginRight: 120}]}> Appointments</Text>
=======
    <ScrollView contentContainerStyle={styles.containerDan}>
      <View style={styles.containerDan2}>
        <View style = {[styles.container3 , Platform.OS!=="web"&&{paddingTop:50}]}>
          <Text style={[styles.pageTitleDan]}> Appointments</Text>
          <View style={styles.adImageContainerAppt}>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.adImage} />}
          </View>

          <View style={styles.calendarIcon}>
            <AntDesign name="calendar" size={30} color="black" />
            <Text style={styles.calendarText}>Book appointment</Text>
          </View>

          <View style={styles.containerDan3}>
            <Text style={styles.text4}>Overview</Text>
          </View>

          <View style={[styles.containerDan2, { marginBottom: 20, paddingHorizontal: 20, marginLeft: 10, marginTop: 20 }]}>
            <View style={styles.buttonContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20 }}>
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
          </View>
          
        
        
        </View>
>>>>>>> Stashed changes
      </View>
    </ScrollView>
  );
};

export default Appointments;