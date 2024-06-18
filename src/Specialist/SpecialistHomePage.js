import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from './SpecialistHome';
import Settings from './SpecialistSettings';
import Resource from './SpecialistResource';
import Forum from './SpecialistForum';
import Appointments from './SpecialistAppointments';

// Bottom Navigation bar
const Tab = createBottomTabNavigator();

// Page Display
export default function SpecialistHomePage() {

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
      <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="Resources" component={Resource} options={{ headerShown: false }} />
      <Tab.Screen name="Forum" component={Forum} options={{ headerShown: false }} />
      <Tab.Screen name="Appointments" component={Appointments} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}