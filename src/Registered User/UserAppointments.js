import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Image, Platform, TouchableOpacity } from 'react-native';
import styles from '../components/styles';
import { firebase } from '../../firebaseConfig';
import { Feather, AntDesign } from '@expo/vector-icons';
import ModalStyle from '../components/ModalStyle';

const UserAppointments = ({navigation}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [activeButton, setActiveButton] = useState('Upcoming');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchImage = async() => {
      try{
        //const url = await firebase.storage().ref('ad/pregnancyAd1.jpeg').getDownloadURL();
        const url = '/assets/ad/pregnancyAd1.jpeg';
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

  const toggleModal = () => { 
    setModalVisible(!isModalVisible);
  };
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container4, Platform.OS!=="web"&&{paddingTop:50}]}>
        <View style={{flexDirection: 'row'}}>
          <AntDesign name="left" size={24} color="black" />
              <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
                <Text style={styles.text}> back </Text>
              </Pressable>
        </View>
        <Text style={[styles.pageTitle]}> Appointments</Text>
      </View>

      <View style={[styles.adImageContainer, {width: '100%', alignItems: 'center'}]}>
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.adImage} alt="Ad" />}
      </View>

      <View style={[styles.container4, { marginBottom: 20}]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate("UserCreateAppointment")}>
            <AntDesign name="calendar" size={30} color="black" />
          </Pressable>

          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate("UserCreateAppointment")}>
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
    </ScrollView>
  );
};

export default UserAppointments;