import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform, TouchableOpacity, TouchableHighlight } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather, AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5, Entypo } from '@expo/vector-icons';

const SpecialistAppointments = ({navigation}) => {
  const [activeButton, setActiveButton] = useState('Upcoming');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  
  const handleCategoryButtonClick = (category) => {
    setActiveButton(category);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  }; 
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container4, Platform.OS!=="web"&&{paddingTop:50}]}>
        <View style={{flexDirection: 'row'}}>
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <AntDesign name="left" size={24} color="black" />
          </Pressable>

          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>
        <Text style={[styles.pageTitle]}> Appointments</Text>
      </View>
      
      <View>
        <View style={styles.appointmentContainer3}>
          <Pressable style={[styles.specialAppointmentIcon]} onPress={() => navigation.navigate("SpecialistCreateAppointment")}>
            <Ionicons name='create-outline' size={30} />
          </Pressable>

          <Pressable style={[styles.formText]} onPress={() => navigation.navigate("SpecialistCreateAppointment")}>
            <Text style={styles.appointmentText6}>Create appointment</Text>
          </Pressable>
        </View>

        <View style={styles.appointmentContainer3}>
          <Pressable style={[styles.specialAppointmentIcon]} onPress={() => navigation.navigate("SpecialistViewSchedule")}>
            <MaterialCommunityIcons name='calendar-check'  size={30}/>
          </Pressable>

          <Pressable style={[styles.formText]} onPress={() => navigation.navigate("SpecialistViewSchedule")}>
            <Text style={styles.appointmentText6}>View schedule</Text>
          </Pressable>
        </View>

        <View style={styles.appointmentContainer3}>
          <Pressable style={[styles.specialAppointmentIcon]} onPress={() => navigation.navigate("SpecialistCreateAd")}>
            <FontAwesome5 name='ad' size={30} />
          </Pressable>

          <Pressable style={[styles.formText]} onPress={() => navigation.navigate("SpecialistCreateAd")}>
            <Text style={styles.appointmentText6}>Create advertisement</Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.questionText, {marginBottom: 20, paddingTop: 20, paddingLeft: 40}]}>Overview</Text>

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

      <View style={styles.appointmentContainer}>
        <View style={styles.specialistAppointmentContainer}>
          <View style={styles.appointmentContainer3}>
            <Text style={styles.appointmentText}>Olivia Lee</Text>

            <TouchableHighlight
              style={styles.danThreeDot}
              onPress={() => toggleDropdown()}
              underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}>
              <Entypo name="dots-three-vertical" size={16} />
            </TouchableHighlight>
          </View>

          <Text style={styles.appointmentText2}>Thursday, 25 April 10:00 - 12:00</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SpecialistAppointments;