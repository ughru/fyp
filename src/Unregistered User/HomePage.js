import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Settings from './Settings';
import PreHome from './PreHome';
import DuringHome from './DuringHome';
import PostHome from './PostHome';
import Resource from './Resource';
import Forum from './Forum';
import Appointments from './Appointments';

// Bottom Navigation bar
const Tab = createBottomTabNavigator();

// Page Display
export default function HomePage() {
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    // Retrieve selected status from AsyncStorage
    const fetchSelectedStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem('selectedStatus');
        if (storedStatus !== null) {
          setSelectedStatus(storedStatus);
        }
      } catch (error) {
        console.error('Error retrieving selected status:', error);
      }
    };

    fetchSelectedStatus();
  }, []);
  
  // Navigate to Home screen based on pregnancy stage
  const getHomeScreen = () => {
    switch (selectedStatus) {
      case 'Pre':
        return PreHome;
      case 'During':
        return DuringHome;
      case 'Post':
        return PostHome;
      default:
        return PreHome;
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
      <Tab.Screen name="Resources" component={Resource} options={{ headerShown: false }} />
      <Tab.Screen name="Forum" component={Forum} options={{ headerShown: false }} />
      <Tab.Screen name="Appointments" component={Appointments} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" options={{ headerShown: false }}>
      {({ navigation }) => ( 
        <Settings navigation={navigation} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}