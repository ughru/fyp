import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, TextInput, Image } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { AntDesign } from '@expo/vector-icons';
import { storage } from '../../firebaseConfig'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import url from "../components/config";

const WeightTracker = ({navigation}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageStyle, setImageStyle] = useState({});
  const [userInfo, setUserInfo] = useState({
    email: '',
    status: '',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user');
        if (storedEmail) {
          const response = await axios.get(`${url}/userinfo?email=${storedEmail}`);
          if (response.data) {
            setUserInfo(response.data);

            // Fetch the appropriate image URL based on the status
            if (response.data.status === "During") {
              const url = await storage.ref('miscellaneous/weight gain.PNG').getDownloadURL();
              setImageUrl(url);
              setImageStyle({ width: 350, height: 120 });
            } else {
              const url = await storage.ref('miscellaneous/bmi.PNG').getDownloadURL();
              setImageUrl(url);
              setImageStyle({ width: 450, height: 120 });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
    <View style={[{ flexDirection: 'row', width: '100%', alignItems: 'center', 
                   marginBottom: 10 } , Platform.OS!=="web"&&{paddingTop:50}]}>

      <View style={{ flexDirection: 'row', alignItems: 'center' , paddingRight:20 }}>
        <AntDesign name="left" size={24} color="black" />
        <Pressable style={[styles.formText]} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.text}> back </Text>
        </Pressable>
      </View>

      <Text style= {[styles.pageTitle]}> Weight Tracker </Text>
    </View>

    <View style={[styles.container4, {marginBottom: 20}]}>
      {/* Display Image */}
      {imageUrl && <Image source={{ uri: imageUrl }} style={[imageStyle, {resizeMode: 'center', alignSelf: 'center', marginBottom: 10}]} />}

      <Text style= {[styles.questionText, { marginBottom: 20}]}> Health Details </Text>
      <View style={[styles.container4, {alignItems: 'center'}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style= {[styles.text]}> Height </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style= {[styles.text]}> Weight </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style= {[styles.text]}> Category </Text>
        </View>
      </View>

      {/* Button */}
      <Pressable style={[styles.button, {marginBottom: 20}]} onPress= {() => navigation.navigate('CreateWeightLog')}>
        <Text style={styles.text}> Log Weight </Text>
      </Pressable>
    </View>

    <View style={[styles.container4, {marginBottom: 20}]}>
      <Text style= {[styles.questionText, {marginBottom: 20}]}> Diet Recommendations </Text>

      <Pressable style={[styles.button, {alignSelf: 'center', marginBottom: 20}]} >
        <Text style={styles.text}> See More </Text>
      </Pressable>
    </View>

    <View style={[styles.container4, {marginBottom: 20}]}>
      <Text style= {[styles.questionText, {marginBottom: 20}]}> Weight Logs </Text>
    </View>

    </ScrollView>
    </Keyboard>
  )
};

export default WeightTracker;