import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Image, TouchableOpacity, Alert, Modal, TextInput, StyleSheet } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { storage } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import url from "../components/config";

const showAlert = (title, message, onPress) => {
  if (Platform.OS === 'web') {
    // For web platform
    window.alert(`${title}\n${message}`);
    if (onPress) onPress();  // Execute the onPress callback for web
  } else {
    // For mobile platforms
    Alert.alert(title, message, [{ text: 'OK', onPress }], { cancelable: false });
  }
};

const WeightTracker = ({ navigation }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageStyle, setImageStyle] = useState({});
  const [weightLogs, setWeightLogs] = useState([]);
  const [image, setErrorImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [heightError, setError1] = useState('');
  const [weightError, setError2] = useState('');
  const [resources, setResources] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [userInfo, setUserInfo] = useState([]);
  const [healthDetails, setHealthDetails] = useState([]);
  const scrollRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [resourcesResponse] = await Promise.all([
        axios.get(`${url}/resource`)
      ]);

      // Filter resources based on category and BMI
      const filteredResources = resourcesResponse.data.resources
        .filter(resource => resource.category === 'Diet Recommendations' && resource.bmi.includes(healthDetails.category));

      // Select random 10 resources if available, otherwise show all filtered resources
      const selectedResources = filteredResources.length >= 10
        ? filteredResources.sort(() => 0.5 - Math.random()).slice(0, 10)
        : filteredResources;

      setResources(selectedResources);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [healthDetails.bmi]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('user');
      if (storedEmail) {
        // Fetch user info
        const userInfoResponse = await axios.get(`${url}/userinfo?email=${storedEmail}`);
        if (userInfoResponse.data) {
          setUserInfo(userInfoResponse.data);
  
          // Fetch the appropriate image URL based on the status
          let imageUrl;
          let imageStyle;
  
          if (userInfoResponse.data.status === "During") {
            imageUrl = await storage.ref('miscellaneous/weight gain.PNG').getDownloadURL();
            imageStyle = { width: 320, height: 100 };
          } else {
            imageUrl = await storage.ref('miscellaneous/bmi.PNG').getDownloadURL();
            imageStyle = { width: 350, height: 150 };
          }
  
          setImageUrl(imageUrl);
          setImageStyle(imageStyle);
  
          // Fetch all weight logs
          const weightLogsResponse = await axios.get(`${url}/allWeightLogs`, { params: { userEmail: storedEmail } });
          if (weightLogsResponse.data && weightLogsResponse.data.length > 0) {
            // Assume the most recent log is the last one in the array
            const weightLogs = weightLogsResponse.data;
            const mostRecentLog = weightLogs.reduce((latest, log) => {
              if (log.record.length > 0) {
                return log.record[log.record.length - 1]; // Get the latest record
              }
              return latest;
            }, {});
  
            setHealthDetails({
              height: mostRecentLog.height || '-',
              weight: mostRecentLog.weight || '-',
              bmi: mostRecentLog.bmi || '-',
              category: mostRecentLog.category || '-'
            });
  
            setWeightLogs(weightLogs); // Set the weight logs
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }, []);

  const fetchImage = useCallback(async () => {
    try {
      const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
      setErrorImage(url);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchImage();
      fetchData();
      fetchUserInfo();
    }, [fetchImage, fetchUserInfo,  fetchData])
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Underweight':
      case 'Obese':
        return 'red';
      case 'Normal Weight':
        return 'green';
      case 'Overweight':
        return 'orange';
      default:
        return 'black';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDeleteLog = async (logDate) => {
    try {
      const userEmail = await AsyncStorage.getItem('user');
      if (!userEmail) {
        showAlert('Error', 'User email not found');
        return;
      }
  
      showAlert(
        'Confirm Delete',
        'Are you sure you want to delete this weight log?',
        async () => {
          try {
            const response = await axios.delete(`${url}/deleteWeightLog`, {
              data: {
                userEmail,
                date: logDate
              }
            });
  
            if (response.status === 200) {
              // Refresh the weight logs after deletion
              setWeightLogs(weightLogs.map(log => ({
                ...log,
                record: log.record.filter(record => record.date !== logDate)
              })).filter(log => log.record.length > 0));
              showAlert('Success', 'Weight log deleted successfully');
            }
          } catch (error) {
            showAlert('Error', 'Failed to delete weight log');
          }
        }
      );
    } catch (error) {
      showAlert('Error', 'Failed to delete weight log');
    }
  };  

  const openModal = (log) => {
    setSelectedLog(log);
    setNewHeight(log.height.toString());
    setNewWeight(log.weight.toString());
    setError1(''); 
    setError2('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    fetchUserInfo();
    setSelectedLog(null);
  };

  const getCategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi <= 23.0) return 'Normal Weight';
    if (bmi >= 23 && bmi <= 29.9) return 'Overweight';
    return 'Obese';
  };

  // Function to calculate BMI
  const calculateBMI = (height, weight) => {
    if (!height || !weight) return '';

    const heightInMeters = parseFloat(height) / 100;
    const bmiValue = parseFloat(weight) / (heightInMeters * heightInMeters);
    return bmiValue.toFixed(2);
  };

  // Function to update weight log
  const handleUpdateLog = async () => {
    let valid = true;
      
    // Validate input fields
    if (!newHeight.trim()) {
      setError1('* Required field');
      valid = false;
    } else if (!/^[0-9]+(\.[0-9]+)?$/.test(newHeight)) {
      setError1('* Height must be a valid number');
      valid = false;
    } else {
      setError1('');
    }
  
    if (!newWeight.trim()) {
      setError2('* Required field');
      valid = false;
    } else if (!/^[0-9]+(\.[0-9]+)?$/.test(newWeight)) {
      setError2('* Weight must be a valid number');
      valid = false;
    } else {
      setError2('');
    }

    // Calculate updated BMI and category
    const updatedBMI = calculateBMI(parseFloat(newHeight), parseFloat(newWeight));
    const updatedCategory = getCategory(updatedBMI);
  
    if (valid) {
    try {
      const response = await axios.put(`${url}/updateWeightLog`, {
        userEmail: userInfo.email,
        date: selectedLog.date,
        height: parseFloat(newHeight),
        weight: parseFloat(newWeight),
        bmi: parseFloat(updatedBMI),
        category: updatedCategory
      });
  
      if (response.status === 200) {
        // Update the weight logs state after successful update
        const updatedLogs = weightLogs.map(log => {
          if (log._id === selectedLog._id) {
            return {
              ...log,
              record: log.record.map(record => {
                if (record.date === selectedLog.date) {
                  return {
                    ...record,
                    height: parseFloat(newHeight),
                    weight: parseFloat(newWeight),
                    bmi: parseFloat(updatedBMI),
                    category: updatedCategory
                  };
                }
                return record;
              })
            };
          }
          return log;
        });
        setWeightLogs(updatedLogs);
        showAlert('Success', 'Weight log updated successfully');
        closeModal();
      } else {
        showAlert('Error', 'Failed to update weight log');
      }
    } catch (error) {
      console.error('Update weight log error:', error);
      showAlert('Error', 'Failed to update weight log');
    }
  }
  };

  // Page Displays
  return (
    <Keyboard>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[{
          flexDirection: 'row', width: '100%', alignItems: 'center',
          marginBottom: 10
        }, Platform.OS !== "web" && { paddingTop: 50 }]}>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 20 }}>
            <AntDesign name="left" size={24} color="black" />
            <Pressable style={[styles.formText]} onPress={() => navigation.navigate("Home")}>
              <Text style={styles.text}> back </Text>
            </Pressable>
          </View>

          <Text style={[styles.pageTitle]}> Weight Tracker </Text>
        </View>

        <View style={[styles.container4, { marginBottom: 20 }]}>
          {/* Display Image */}
          {imageUrl && <Image source={{ uri: imageUrl }} style={[imageStyle, { resizeMode: 'center', alignSelf: 'center', marginBottom: 10 }]} />}

          {/* Health Details View */}
          <Text style={[styles.questionText, { marginBottom: 20 }]}> Health Details </Text>
          <View style={[styles.container4, { alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.text3]}> Height: </Text>
              <Text style={[styles.text]}>{healthDetails.height} cm</Text>
            </View>
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.text3]}> Weight: </Text>
              <Text style={[styles.text]}>{healthDetails.weight} kg</Text>
            </View>
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.text3]}> BMI: </Text>
              <Text style={[styles.text]}>{healthDetails.bmi}</Text>
            </View>
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.text3]}> Category: </Text>
              <Text style={[styles.text, { color: getCategoryColor(healthDetails.category) }]}>{healthDetails.category}</Text>
            </View>
          </View>

          {/* Button */}
          <Pressable style={[styles.button, { marginBottom: 20 }]} onPress={() => navigation.navigate('CreateWeightLog')}>
            <Text style={styles.text}> Log Weight </Text>
          </Pressable>

          <Text style={[styles.questionText]}> Diet Recommendations </Text>
        </View>

        {/* Diet Reco Section */}
        <View style={[styles.container4]}>
          <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 20, paddingVertical: 10 }}>
            {resources.map((resource, index) => (
              <View key={index} style={{ marginBottom: 20 }}>
                <TouchableOpacity
                  style={styles.resourceBtn}
                  onPress={() => navigation.navigate('UserResourceInfo', { resourceID: resource.resourceID })}
                >
                  <View style={{ ...StyleSheet.absoluteFillObject }}>
                    <Image
                      source={{ uri: resource.imageUrl }}
                      style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' }}
                    />
                  </View>
                </TouchableOpacity>
                <Text style={[styles.text, { marginTop: 5, width: 100, textAlign: 'flex-start' }]}>
                  {resource.title}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* All Weight Logs View Section */}
        <View style={[styles.container4, { marginBottom: 20 }]}>
          <Text style={[styles.questionText]}> Weight Logs </Text>
        </View>

        <View>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#E3C2D7' }}>
            <Text style={{ width: 50, fontWeight: 'bold' }}>Date</Text>
            <Text style={{ width: 50, fontWeight: 'bold' }}>Weight</Text>
            {userInfo.status === "During" && 
              <Text style={{ width: 40, fontWeight: 'bold' }}>+/-</Text>
            }
            <Text style={{ width: 40, fontWeight: 'bold' }}>Bmi</Text>
            <Text style={{ width: 80, fontWeight: 'bold' }}>Category</Text>
            <Text style={{ width: 50, fontWeight: 'bold' }}></Text>
          </View>

          {/* Weight Logs */}
          {weightLogs.length > 0 ? (
            weightLogs.map((log) => (
              log.record.map((record, index) => (
                <View key={`${log._id}-${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#E3C2D7' }}>
                  <Text style={{ width: 50 }}>{formatDate(record.date)}</Text>
                  <Text style={{ width: 50 }}>{record.weight} kg</Text>
                  {userInfo.status === "During" && 
                    <Text style={{ width: 40}}>{record.difference}</Text>
                  }
                  <Text style={{ width: 40 }}>{record.bmi}</Text>
                  <Text style={{ width: 80, color: getCategoryColor(record.category) }}>{record.category}</Text>
                  <TouchableOpacity style={{ width: 22, marginRight: 5 }} onPress={() => openModal(record)}>
                    <Feather name="edit" size={22} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 22, alignItems: 'flex-end' }} onPress={() => handleDeleteLog(record.date)}>
                    <MaterialIcons name="delete" size={22} />
                  </TouchableOpacity>
                </View>
              ))
            ))
          ) : (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
              {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginBottom: 20 }} />}
              <Text style={[styles.formText, { fontStyle: 'italic' }]}> Oops! Nothing here yet </Text>
            </View>
          )}
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
        <View style= {styles.modalOverlay}>
          <View style={{width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20}}>
            <Text style={[styles.modalTitle]}>Weight Log</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color="black"/>
              </TouchableOpacity>
            </View>
            <ScrollView style= {styles.container5}>
              <Text style= {[styles.text, {marginBottom: 10}]}>Date: {formatDate(selectedLog?.date)}</Text>
              <Text style={[styles.text, {marginBottom: 10}]}>Height(cm): {heightError ? <Text style={styles.error}>{heightError}</Text> : null}</Text>
              <TextInput
                style={{height: 40, padding: 10,borderRadius: 20, borderWidth: 1, borderColor: '#979595', marginBottom: 20}}
                value={newHeight}
                onChangeText={setNewHeight}
                keyboardType="numeric"
              />
              <Text style={[styles.text, {marginBottom: 10}]}>Weight(kg): {weightError ? <Text style={styles.error}>{weightError}</Text> : null}</Text>
              <TextInput
                style={{height: 40, padding: 10,borderRadius: 20, borderWidth: 1, borderColor: '#979595', marginBottom: 20}}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.button3} onPress={handleUpdateLog}>
                <Text style={styles.text}>Update Log</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </Keyboard>
  )
};

export default WeightTracker;