import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-reanimated';

// Unregistered user screens
import Welcome from "./src/Welcome";
import Personalisation from './src/Personalisation';
import HomePage from './src/HomePage/';
import AccountType from './src/AccountType/';
import RegisterUser from './src/RegisterUser/';
import RegisterSpecialist from './src/RegisterSpecialist/';
import Login from './src/Login/';

// Nav Screens (Unregistered user)
import Settings from './src/Settings/';
import PreHome from './src/Nav Screens/PreHome/';
import DuringHome from './src/Nav Screens/DuringHome/';
import PostHome from './src/Nav Screens/PostHome/';
import Resource from './src/Nav Screens/Resource/';
import Forum from './src/Nav Screens/Forum/';
import Appointments from './src/Nav Screens/Appointments/';

// Registered user screens
import RegisteredHome from './src/Registered User/RegisteredHome/';
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
                <Stack.Screen name="Welcome" component= {Welcome} options={{ headerShown: false }}/>
                <Stack.Screen name="Personalisation" component= {Personalisation} options={{ headerShown: false }}/>

                <Stack.Screen name="HomePage" component= {HomePage} options={{ headerShown: false }}/>
                <Stack.Screen name="PreHome" component= {PreHome} options={{ headerShown: false }}/>
                <Stack.Screen name="DuringHome" component= {DuringHome} options={{ headerShown: false }}/>
                <Stack.Screen name="PostHome" component= {PostHome} options={{ headerShown: false }}/>
                <Stack.Screen name="Settings" component= {Settings} options={{ headerShown: false }}/>
                <Stack.Screen name="Resource" component= {Resource} options={{ headerShown: false }}/>
                <Stack.Screen name="Forum" component= {Forum} options={{ headerShown: false }}/>
                <Stack.Screen name="Appointmentss" component= {Appointments} options={{ headerShown: false }}/>

                <Stack.Screen name="AccountType" component= {AccountType} options={{ headerShown: false }}/>
                <Stack.Screen name="RegisterUser" component= {RegisterUser} options={{ headerShown: false }}/> 
                <Stack.Screen name="RegisterSpecialist" component= {RegisterSpecialist} options={{ headerShown: false }}/>
                <Stack.Screen name="Login" component= {Login} options={{ headerShown: false }}/>

                <Stack.Screen name="RegisteredHome" component= {RegisteredHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserSettings" component= {UserSettings} options={{ headerShown: false }}/>
                <Stack.Screen name="CycleHistory" component= {CycleHistory} options={{ headerShown: false }}/>
                <Stack.Screen name="LogPeriod" component= {LogPeriod} options={{ headerShown: false }}/>
                <Stack.Screen name="WeightTracker" component= {WeightTracker} options={{ headerShown: false }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}