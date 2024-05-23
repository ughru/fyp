import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-reanimated';

// Main App Screens
import Welcome from "./src/Welcome";
import Personalisation from './src/Personalisation';
import AccountType from './src/AccountType/';
import RegisterUser from './src/RegisterUser/';
import RegisterSpecialist from './src/RegisterSpecialist/';
import Login from './src/Login/';

// Unregistered user screens
import HomePage from './src/Unregistered User/HomePage/';
import Settings from './src/Unregistered User/Settings';
import PreHome from './src/Unregistered User/PreHome';
import DuringHome from './src/Unregistered User/DuringHome';
import PostHome from './src/Unregistered User/PostHome';
import Resource from './src/Unregistered User/Resource';
import ResourceInfo from './src/Unregistered User/ResourceInfo';
import Forum from './src/Unregistered User/Forum';
import Appointments from './src/Unregistered User/Appointments';

// Registered user screens
import RegisteredHome from './src/Registered User/RegisteredHome/';
import UserPreHome from './src/Registered User/UserPreHome/';
import UserDuringHome from './src/Registered User/UserDuringHome/';
import UserPostHome from './src/Registered User/UserPostHome/';
import UserResource from './src/Registered User/UserResource/';
import UserForum from './src/Registered User/UserForum/';
import UserAppointments from './src/Registered User/UserAppointments/';
import UserSettings from './src/Registered User/UserSettings/';
import LogPeriod from './src/Registered User/LogPeriod/';
import CycleHistory from './src/Registered User/CycleHistory/';
import WeightTracker from './src/Registered User/WeightTracker/';

// Specialist screens

// System admin screens

// Create a stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
    return (
        // Navigation 
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Welcome">
                {/* Start Screens */}
                <Stack.Screen name="Welcome" component= {Welcome} options={{ headerShown: false }}/>
                <Stack.Screen name="Personalisation" component= {Personalisation} options={{ headerShown: false }}/>

                {/* Register & Login */}
                <Stack.Screen name="AccountType" component= {AccountType} options={{ headerShown: false }}/>
                <Stack.Screen name="RegisterUser" component= {RegisterUser} options={{ headerShown: false }}/> 
                <Stack.Screen name="RegisterSpecialist" component= {RegisterSpecialist} options={{ headerShown: false }}/>
                <Stack.Screen name="Login" component= {Login} options={{ headerShown: false }}/>

                {/* Unregistered User Screens */}
                <Stack.Screen name="HomePage" component= {HomePage} options={{ headerShown: false }}/>
                <Stack.Screen name="PreHome" component= {PreHome} options={{ headerShown: false }}/>
                <Stack.Screen name="DuringHome" component= {DuringHome} options={{ headerShown: false }}/>
                <Stack.Screen name="PostHome" component= {PostHome} options={{ headerShown: false }}/>
                <Stack.Screen name="Settings" component= {Settings} options={{ headerShown: false }}/>
                <Stack.Screen name="Resource" component= {Resource} options={{ headerShown: false }}/>
                <Stack.Screen name="ResourceInfo" component= {ResourceInfo} options={{ headerShown: false }}/>
                <Stack.Screen name="Forum" component= {Forum} options={{ headerShown: false }}/>
                <Stack.Screen name="Appointments" component= {Appointments} options={{ headerShown: false }}/>

                {/* Registered User Screens */}
                <Stack.Screen name="RegisteredHome" component= {RegisteredHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserPreHome" component= {UserPreHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserDuringHome" component= {UserDuringHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserPostHome" component= {UserPostHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserResource" component= {UserResource} options={{ headerShown: false }}/>
                <Stack.Screen name="UserForum" component= {UserForum} options={{ headerShown: false }}/>
                <Stack.Screen name="UserAppointments" component= {UserAppointments} options={{ headerShown: false }}/>
                <Stack.Screen name="UserSettings" component= {UserSettings} options={{ headerShown: false }}/>
                <Stack.Screen name="CycleHistory" component= {CycleHistory} options={{ headerShown: false }}/>
                <Stack.Screen name="LogPeriod" component= {LogPeriod} options={{ headerShown: false }}/>
                <Stack.Screen name="WeightTracker" component= {WeightTracker} options={{ headerShown: false }}/>

                {/* Specialist User Screens */}

                {/* Sys Admin Screens */}
            </Stack.Navigator>
        </NavigationContainer>
    );
}