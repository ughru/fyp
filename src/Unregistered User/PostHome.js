import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Platform, Image, StyleSheet } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import styles from '../components/styles';
import { fetchResources } from '../components/manageResource';
import ModalStyle from '../components/ModalStyle';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const PostHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [resources, setResources] = useState([]);
  const scrollRef = useRef();
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const date = new Date();
    const formattedDate = formatDate(date);

    const fetchAndSetResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    };

    fetchAndSetResources();
    setCurrentDate(formattedDate);
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.container4, { ...Platform.select({ web: {}, default: { marginTop: 50 } }) }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, { marginTop: 10, marginBottom: 30 }]}>Welcome to Bloom!</Text>
      </View>

      <View style={[styles.container4, { marginBottom: 20 }]}>
        <Text style={[styles.text, { marginBottom: 20 }]}>Upcoming Appointments</Text>
        <View style={{flex:1 , flexDirection:'row' , alignSelf:'center'}}>
          <View style={[styles.button4, { flexDirection: 'row' }]}>
            <Feather name="calendar" size={24} color="black" />
            <Text style={styles.textInputWithIcon2}>No Appointments Yet</Text>
          </View>
        </View>

        <View style={[styles.container3, { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 40 }]}>
          <Ionicons name="scale-outline" size={24} color="black" style={{ marginRight: 10 }} />
          <Pressable onPress={toggleModal}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>

        <View style={[styles.container4]}>
          <Text style={[styles.titleNote, {marginBottom: 20}]}>Suggested for you</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <View style={{alignItems: 'center'}}>
              <MaterialCommunityIcons name="baby-face-outline" size={35} color="black" />
              <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Newborn Care</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <MaterialCommunityIcons name="mother-heart" size={35} color="black" />
              <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Recovery</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <MaterialIcons name="health-and-safety" size={35} color="black" />
              <Text style={[styles.text, {marginTop: 10, textAlign: 'center'}]}>Health</Text>
            </View>
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

      <ModalStyle isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
    </ScrollView>
  );
};

export default PostHome;