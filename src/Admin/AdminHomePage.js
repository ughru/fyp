import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminHome from './AdminHome';
import AdminForum from './AdminForum';
import AdminSettings from './AdminSettings';

// Bottom Navigation bar
const Tab = createBottomTabNavigator();

// Page Display
export default function AdminHomePage() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Forum') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
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
      <Tab.Screen name="Home" component={AdminHome} options={{ headerShown: false }} />
      <Tab.Screen name="Forum" component={AdminForum} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={AdminSettings} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}