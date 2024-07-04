import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, Image, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { storage } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import url from "../components/config";

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
  const [selectedLog, setSelectedLog] = useState(null);
  const [userInfo, setUserInfo] = useState({
    email: '',
    status: '',
  });
  const [healthDetails, setHealthDetails] = useState({
    height: '-',
    weight: '-',
    bmi: '-',
    category: '-'
  });

  const fetchUserInfo = useCallback(async () => {
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
            setImageStyle({ width: 320, height: 100 });
          } else {
            const url = await storage.ref('miscellaneous/bmi.PNG').getDownloadURL();
            setImageUrl(url);
            setImageStyle({ width: 350, height: 150 });
          }

          // Fetch today's weight log or the most recent log
          const weightLogResponse = await axios.get(`${url}/recentLog`, { params: { userEmail: storedEmail } });
          if (weightLogResponse.data) {
            const latestLog = weightLogResponse.data;
            setHealthDetails({
              height: latestLog.height || '-',
              weight: latestLog.weight || '-',
              bmi: latestLog.bmi || '-',
              category: latestLog.category || '-'
            });
          }

          const allWeightLogsResponse = await axios.get(`${url}/allWeightLogs`, { params: { userEmail: storedEmail } });
          if (allWeightLogsResponse.data) {
            setWeightLogs(allWeightLogsResponse.data);
          }
        }
      }
    } catch (error) {
      // Remove console error logs
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
      fetchUserInfo();
    }, [fetchImage, fetchUserInfo])
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
        Alert.alert('Error', 'User email not found');
        return;
      }
  
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this weight log?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
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
                  Alert.alert('Success', 'Weight log deleted successfully');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to delete weight log');
              }
            },
            style: 'destructive'
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete weight log');
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
        Alert.alert('Success', 'Weight log updated successfully');
        closeModal();
      } else {
        Alert.alert('Error', 'Failed to update weight log');
      }
    } catch (error) {
      console.error('Update weight log error:', error);
      Alert.alert('Error', 'Failed to update weight log');
    }}
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
        </View>

        {/* Diet Reco Section */}
        <View style={[styles.container4, { marginBottom: 20 }]}>
          <Text style={[styles.questionText, { marginBottom: 20 }]}> Diet Recommendations </Text>

          <Pressable style={[styles.button, { alignSelf: 'center', marginBottom: 20 }]} >
            <Text style={styles.text}> See More </Text>
          </Pressable>
        </View>

        {/* All Weight Logs View Section */}
        <View style={[styles.container4, { marginBottom: 20 }]}>
          <Text style={[styles.questionText]}> Weight Logs </Text>
        </View>

        <View>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#E3C2D7' }}>
            <Text style={{ width: 50, fontWeight: 'bold' }}>Date</Text>
            <Text style={{ width: 60, fontWeight: 'bold' }}>Weight</Text>
            {userInfo.status === "During" && (
              <Text style={{ width: 40, fontWeight: 'bold' }}>+/-</Text>
            )}
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
                  <Text style={{ width: 60 }}>{record.weight} kg</Text>
                  {userInfo.status === "During" && (
                    <Text style={{ width: 40 }}></Text>
                  )}
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
              />
              <Text style={[styles.text, {marginBottom: 10}]}>Weight(kg): {weightError ? <Text style={styles.error}>{weightError}</Text> : null}</Text>
              <TextInput
                style={{height: 40, padding: 10,borderRadius: 20, borderWidth: 1, borderColor: '#979595', marginBottom: 20}}
                value={newWeight}
                onChangeText={setNewWeight}
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