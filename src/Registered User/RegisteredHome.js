import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import UserSettings from './UserSettings';
import UserPreHome from './UserPreHome';
import UserDuringHome from './UserDuringHome';
import UserPostHome from './UserPostHome';
import UserResource from './UserResource';
import UserForum from './UserForum';
import UserAppointments from './UserAppointments';
import url from "../components/config";

// Bottom Navigation bar
const Tab = createBottomTabNavigator();

// Page Display
export default function RegisteredHome() {
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    // Retrieve user info from the database
    const fetchUserInfo = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user');
        if (storedEmail) {
          const response = await axios.get(`${url}/userinfo?email=${storedEmail}`);
          if (response.data) {
            setSelectedStatus(response.data.status);
          }
        }
      } catch (error) {
        console.error('Error retrieving user info:', error);
      }
    };

    fetchUserInfo();
  }, []);
  
  // Navigate to Home screen based on pregnancy stage
  const getHomeScreen = () => {
    if (selectedStatus === "Pre")
      {
        return UserPreHome;
      }
      else if (selectedStatus === "During")
      {
        return UserDuringHome;
      }
      else{
        return UserPostHome;
      }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Resources') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Forum') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#D39FC0',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle:{
          padding:3
        }
      })}
    >
      <Tab.Screen name="Home" component={getHomeScreen()} options={{ headerShown: false }} />
      <Tab.Screen name="Resources" component={UserResource} options={{ headerShown: false }} />
      <Tab.Screen name="Forum" component={UserForum} options={{ headerShown: false }} />
      <Tab.Screen name="Appointments" component={UserAppointments} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" options={{ headerShown: false }}>
        {({ navigation }) => ( // Ensure to destructure the navigation prop here
        <UserSettings navigation={navigation} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
