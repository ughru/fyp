import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import styles from '../components/styles';
import { fetchResources } from '../components/manageResource';
import ModalStyle from '../components/ModalStyle';
import { storage } from '../../firebaseConfig'; 

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const DuringHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [resources, setResources] = useState([]);
  const scrollRef = useRef();
  const [isModalVisible, setModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const date = new Date();
    const formattedDate = formatDate(date);

    const fetchAndSetResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    };

    const fetchImage = async () => {
      try {
        const url = await storage.ref('miscellaneous/illustration.PNG').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchAndSetResources();
    setCurrentDate(formattedDate);
    fetchImage();
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.container4,
        {...Platform.select({
          web: {marginBottom:20},
          default: {paddingTop:50, marginBottom: 20},
        })}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, { marginTop: 20}]}>Welcome to Bloom!</Text>
      </View>

      <View style={[styles.container4, { marginBottom: 20}]}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 98, height: 120}} />}
          <View style={{alignItems: 'center', marginLeft: 30}}>
            <Text style={[styles.formText, { marginBottom: 10 }]}>You are Pregnant for</Text>
            <Text style={[styles.questionText, { marginBottom: 20 }]}>Weeks</Text>
            <Pressable style={[styles.button3]} onPress={toggleModal}>
              <Text style={styles.text}>Details</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="scale-outline" size={24} color="black" />
          <Pressable  style={{ marginLeft: 10 }} onPress={toggleModal}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>

        <Text style={[styles.titleNote, {marginBottom: 20}]}>What to expect</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
          <View style={{alignItems: 'center'}}>
            <MaterialCommunityIcons name="baby-face-outline" size={35} color="black" />
            <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Baby's growth</Text>
          </View>
          <View style={{alignItems: 'center'}}>
            <MaterialCommunityIcons name="mother-heart" size={35} color="black" />
            <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Body changes</Text>
          </View>
          <View style={{alignItems: 'center'}}>
            <MaterialIcons name="health-and-safety" size={35} color="black" />
            <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Health</Text>
          </View>
        </View>
      </View>

      <View>
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingVertical: 10 }}>
          {resources.map(
            (resource, index) => (
              <View key={index} style= {{marginBottom: 20}}>
              <TouchableOpacity
                key={index}
                style={styles.resourceBtn}
                onPress={toggleModal}
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
            )
          )}
        </ScrollView>
      </View>

      <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => navigation.navigate("Resources")}>
        <Text style={styles.text}>See more</Text>
      </Pressable>

      <ModalStyle  isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
    </ScrollView>
  );
};

export default DuringHome;