import React, { useEffect, useState, useCallback} from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Platform, TextInput, Alert, Modal, Image } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../components/styles';
import url from '../components/config';
import { useFocusEffect } from '@react-navigation/native';
import {storage, auth } from '../../firebaseConfig'; 

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const AdminHome = ({navigation}) => {
  const [currentDate, setCurrentDate] = useState(null);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [specialists, setSpecialist] = useState([]);
  const [activeButton, setActiveButton] = useState('All');
  const [adminInfo, setAdminInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  const fetchAdminInfo = useCallback(async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('user');
      if (storedEmail) {
        const response = await axios.get(`${url}/admininfo?email=${storedEmail}`);
        if (response.data) {
          setAdminInfo(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get(`${url}/userinfo`);
        const specialistsResponse = await axios.get(`${url}/specialistinfo`);
  
        setUsers(usersResponse.data.users || []);
        setSpecialist(specialistsResponse.data.specialists || []);
      } catch (error) {
        console.error('Error retrieving data:', error);
      }
    };

    const setCurrentDateFormatted = () => {
      const date = new Date();
      const formattedDate = formatDate(date);
      setCurrentDate(formattedDate);
    };

    const fetchImage = async () => {
      try {
       const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchAdminInfo();
    fetchData();
    setCurrentDateFormatted();
    fetchImage();
  }, [fetchAdminInfo]);

  useFocusEffect(
    useCallback(() => {
      fetchAdminInfo();
    }, [fetchAdminInfo])
  );

  const handleCategoryButtonClick = async (category) => {
    setActiveButton(category);

    try {
      if (category === "All") {
        const usersResponse = await axios.get(`${url}/userinfo`);
        const specialistsResponse = await axios.get(`${url}/specialistinfo`);
  
        const usersWithTypes = usersResponse.data.users.map(user => ({ ...user, type: 'User' }));
        const specialistsWithTypes = specialistsResponse.data.specialists.map(specialist => ({ ...specialist, type: 'Specialist' }));

        setUsers(usersWithTypes);
        setSpecialist(specialistsWithTypes);
      } else if (category === "Users") {
        const response = await axios.get(`${url}/userinfo`);
        setUsers(response.data.users|| []);
      } else if (category === "Specialist") {
        const response = await axios.get(`${url}/specialistinfo`);
        const specialistsWithTypes = response.data.specialists.map(specialist => ({ ...specialist, type: 'Specialist' }));
        setSpecialist(specialistsWithTypes);
      }
    } catch (error) {
      console.error(`Error retrieving ${category} info:`, error);
      // Handle error (e.g., show error message, retry fetching, etc.)
    }
  };

  const handleSuspend = (email) => {
    Alert.alert(
      "Confirm Suspend",
      `Are you sure you want to suspend the user: ${email}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const response = await axios.post(`${url}/suspendUser`, { email });
              if (response.data.success) {
                Alert.alert("Success", "User has been suspended.");
                handleCategoryButtonClick(activeButton); // Refresh the list
              } else {
                Alert.alert("Error", "Failed to suspend the user.");
              }
            } catch (error) {
              console.error('Error suspending user:', error);
              Alert.alert("Error", "An error occurred while suspending the user.");
            }
          }
        }
      ]
    );
  };

  const handleReactivate = (email) => {
    Alert.alert(
      "Confirm Reactivate",
      `Are you sure you want to reactivate the user: ${email}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const response = await axios.post(`${url}/reactivateUser`, { email });
              if (response.data.success) {
                Alert.alert("Success", "User has been reactivated.");
                handleCategoryButtonClick(activeButton); // Refresh the list
              } else {
                Alert.alert("Error", "Failed to reactivate the user.");
              }
            } catch (error) {
              console.error('Error reactivating user:', error);
              Alert.alert("Error", "An error occurred while reactivating the user.");
            }
          }
        }
      ]
    );
  };

  const handleSearch = () => {
    // Filter users based on search query
    const filteredUsers = users.filter(user =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
    );
  
    // Filter specialists based on search query
    const filteredSpecialists = specialists.filter(specialist =>
      specialist.email.toLowerCase().includes(search.toLowerCase()) ||
      specialist.firstName.toLowerCase().includes(search.toLowerCase()) ||
      specialist.lastName.toLowerCase().includes(search.toLowerCase())
    );
  
    setFilteredUsers(filteredUsers);
    setFilteredSpecialists(filteredSpecialists);
  };  

  const renderAll = () => {
    const allData= search ? [...filteredUsers, ...filteredSpecialists] : [...users, ...specialists];
    if (allData.length > 0) {
    return(
    <View>
        {/* Header Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#E3C2D7' }}>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>Email</Text>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>Name</Text>
          <Text style={{ width: 60, fontWeight: 'bold' }}>Type</Text>
          <Text style={{ width: 50, fontWeight: 'bold' }}>State</Text>
          <Text style={{ width: 40, fontWeight: 'bold' }}>Action</Text>
          <Text style={{ width: 10, fontWeight: 'bold' }}></Text>
        </View>

        {allData.map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderWidth: 1, borderColor: '#ddd' }}>
            <Text style={{ flex: 1 }}>{item.email}</Text>
            <Text style={{ flex: 1 }}>{item.firstName} {item.lastName}</Text>
            <Text style={{ width: 60, }}>{item.type}</Text>
            <Text style={{ width: 50 }}>{item.state}</Text>
            <TouchableOpacity style={{ width: 30}} onPress={() => openModal(item)}>
              <Ionicons name="eye-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (item.state === 'active') {
                handleSuspend(item.email);
              } else if (item.state === 'suspended') {
                handleReactivate(item.email);
              }
            }} style={{ width: 20, alignItems: 'center' }}>
              {item.state === 'active' ? (
                <MaterialIcons name="delete" size={24} />
              ) : item.state === 'suspended' ? (
                <MaterialCommunityIcons name="account-reactivate" size={24} color="black" />
              ) : null}
            </TouchableOpacity>
          </View>
        ))}
      </View>
      );
  } else {
    // Display an image when allData is empty
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
           {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200, marginBottom: 20 }} />}
           <Text style= {[styles.formText, {fontStyle: 'italic'}]}> Oops! No Users Found </Text>
        </View>
    );
  }
};

  const renderUsers = () => {
    const userSearch = search ? filteredUsers : users;
    if (userSearch.length > 0) {
    return (
      <View>
        {/* Header Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#E3C2D7' }}>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>Email</Text>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>Name</Text>
          <Text style={{ width: 60, fontWeight: 'bold' }}>Status</Text>
          <Text style={{ width: 50, fontWeight: 'bold' }}>State</Text>
          <Text style={{ width: 40, fontWeight: 'bold' }}>Action</Text>
          <Text style={{ width: 10, fontWeight: 'bold' }}></Text>
        </View>

        {userSearch.map((user, index) => (
          <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderWidth: 1, borderColor: '#ddd' }}>
            <Text style={{ flex: 1 }}>{user.email}</Text>
            <Text style={{ flex: 1 }}>{user.firstName} {user.lastName}</Text>
            <Text style={{ width: 60 }}>{user.status}</Text>
            <Text style={{ width: 50 }}>{user.state}</Text>
            <TouchableOpacity style={{ width: 30}} onPress={() => openModal(user)}>
              <Ionicons name="eye-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (user.state === 'active') {
                handleSuspend(user.email);
              } else if (user.state === 'suspended') {
                handleReactivate(user.email);
              }
            }} style={{ width: 20, alignItems: 'center' }}>
              {user.state === 'active' ? (
                <MaterialIcons name="delete" size={24} />
              ) : user.state === 'suspended' ? (
                <MaterialCommunityIcons name="account-reactivate" size={24} color="black" />
              ) : null}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  } else {
    // Display an image when allData is empty
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
           {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200, marginBottom: 20 }} />}
           <Text style= {[styles.formText, {fontStyle: 'italic'}]}> Oops! No Users Found </Text>
        </View>
    );
  }
};

  const renderSpecialist = () => {
    const specialistSearch = search ? filteredSpecialists : specialists;
    if (specialistSearch.length > 0) {
    return (
      <View>
        {/* Header Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#E3C2D7' }}>
          <Text style={{ flex:1, fontWeight: 'bold' }}>Email</Text>
          <Text style={{ flex:1, fontWeight: 'bold'}}>Name</Text>
          <Text style={{ flex:1, marginRight: 5, fontWeight: 'bold' }}>Specialisation</Text>
          <Text style={{ width: 50, fontWeight: 'bold' }}>State</Text>
          <Text style={{ width: 40, fontWeight: 'bold' }}>Action</Text>
          <Text style={{ width: 10, fontWeight: 'bold' }}></Text>
        </View>

        {specialistSearch.map((specialist, index) => (
          <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderWidth: 1, borderColor: '#ddd' }}>
            <Text style={{ flex: 1 }}>{specialist.email}</Text>
            <Text style={{ flex: 1}}>{specialist.firstName} {specialist.lastName}</Text>
            <Text style={{ flex: 1, marginRight: 5 }}>{specialist.specialisation}</Text>
            <Text style={{ width: 50 }}>{specialist.state}</Text>
            <TouchableOpacity style={{ width: 30}} onPress={() => openModal(specialist)}>
              <Ionicons name="eye-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (specialist.state === 'active') {
                handleSuspend(specialist.email);
              } else if (specialist.state === 'suspended') {
                handleReactivate(specialist.email);
              }
            }} style={{ width: 20, alignItems: 'center' }}>
              {specialist.state === 'active' ? (
                <MaterialIcons name="delete" size={24} />
              ) : specialist.state === 'suspended' ? (
                <MaterialCommunityIcons name="account-reactivate" size={24} color="black" />
              ) : null}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  } else {
    // Display an image when allData is empty
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
           {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200, marginBottom: 20 }} />}
           <Text style= {[styles.formText, {fontStyle: 'italic'}]}> Oops! No Users Found </Text>
        </View>
    );
  }
};

  const openModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const UserModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style= {styles.modalOverlay}>
          <View style={{width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20}}>
            <Text style={[styles.modalTitle]}>User Information</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color="black"/>
              </TouchableOpacity>
            </View>
            <ScrollView style= {styles.container5}>
              <Text style= {[styles.text, {marginBottom: 10}]}>Email: {selectedUser?.email}</Text>
              <Text style= {[styles.text, {marginBottom: 10}]}>Full Name: {selectedUser?.firstName} {selectedUser?.lastName}</Text>
              {selectedUser?.type === "Specialist" ? (
              <Text style={[styles.text, {marginBottom: 10}]}>Specialisation: {selectedUser?.specialisation}</Text>
              ) : (
                <Text style={[styles.text, {marginBottom: 10}]}>Status: {selectedUser?.status}</Text>
              )}
              <Text style= {[styles.text, {marginBottom: 10}]}>State: {selectedUser?.state}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
 
  // Page Displays
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.container4, { ...Platform.select({ web: {}, default: { marginTop: 50 } }) }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <Text style={[styles.textTitle, {marginTop: 10, marginBottom: 20}]}>Welcome, {adminInfo.firstName}!</Text>
      </View>

      <View style= {[styles.container3]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <FontAwesome5 name="ad" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={() => navigation.navigate("AdminAdvertisements")}>
            <Text style={styles.questionText}>Advertisements</Text>
          </Pressable>
        </View>
        {/* 
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <FontAwesome5 name="clipboard-list" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }}>
            <Text style={styles.questionText}>Manage Reports</Text>
          </Pressable>
        </View>

        <Text style= {styles.questionText}> Manage Users </Text>
        */}

        {/* Search Bar */}
        <View style={[styles.search, { right: 30, marginBottom: 20}]}>
          <View style={[styles.iconContainer, {left: 40}]}>
            <Ionicons name="search-outline" size={24} color="black" />
          </View>
          <TextInput
            style={[styles.input3, styles.textInputWithIcon]}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch} // Trigger search when pressing Enter/Submit
            placeholder="Search"
            placeholderTextColor="black"
          />
        </View>

        {/* Category */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => handleCategoryButtonClick("All")}
            style={activeButton === 'All' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCategoryButtonClick("Users")}
            style={activeButton === 'Users' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCategoryButtonClick("Specialist")}
            style={activeButton === 'Specialist' ? styles.categoryBtnActive : styles.categoryBtn}
          >
            <Text style={styles.text}>Specialist</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{marginTop: 20}}>
          {activeButton === 'All' && renderAll()}
          {activeButton === 'Users' && renderUsers()}
          {activeButton === 'Specialist' && renderSpecialist()}
        </ScrollView>
      </View>
      <UserModal />
    </ScrollView>
  );
};

export default AdminHome;