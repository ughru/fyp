import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-reanimated';

// Main App Screens
import Welcome from "./src/Welcome";
import Personalisation from './src/Personalisation';
import RegisterUser from './src/RegisterUser/';
import RegisterSpecialist from './src/RegisterSpecialist/';
import Login from './src/Login/';
import ForgetPw from './src/ForgetPw/';

// Unregistered user screens
import HomePage from './src/Unregistered User/HomePage/';
import Settings from './src/Unregistered User/Settings';
import PreHome from './src/Unregistered User/PreHome';
import DuringHome from './src/Unregistered User/DuringHome';
import PostHome from './src/Unregistered User/PostHome';
import Resource from './src/Unregistered User/Resource';
import Forum from './src/Unregistered User/Forum';
import Appointments from './src/Unregistered User/Appointments';

// Registered user screens
import RegisteredHome from './src/Registered User/RegisteredHome/';
import UserPreHome from './src/Registered User/UserPreHome/';
import UserDuringHome from './src/Registered User/UserDuringHome/';
import UserPostHome from './src/Registered User/UserPostHome/';
import UserResource from './src/Registered User/UserResource/';
import UserResourceInfo from './src/Registered User/UserResourceInfo';
import UserForum from './src/Registered User/UserForum/';
import UserCreatePost from './src/Registered User/UserCreatePost/';
import UserUpdatePost from './src/Registered User/UserUpdatePost/';
import UserAppointments from './src/Registered User/UserAppointments/';
import UserBookAppointment from './src/Registered User/UserBookAppointment/';
import UserSettings from './src/Registered User/UserSettings/';
import UserEditProfile from './src/Registered User/UserEditProfile/';
import LogPeriod from './src/Registered User/LogPeriod/';
import UpdatePeriodLog from './src/Registered User/UpdatePeriodLog/';
import CycleHistory from './src/Registered User/CycleHistory/';
import WeightTracker from './src/Registered User/WeightTracker/';
import CreateWeightLog from './src/Registered User/CreateWeightLog/';
import UserPersonalisation from './src/Registered User/UserPersonalisation/';

// Specialist screens
import SpecialistHome from './src/Specialist/SpecialistHome/';
import SpecialistHomePage from './src/Specialist/SpecialistHomePage/';
import CreateResource from './src/Specialist/CreateResource/';
import UpdateResource from './src/Specialist/UpdateResource/';
import SpecialistResource from './src/Specialist/SpecialistResource/';
import SpecialistResourceInfo from './src/Specialist/SpecialistResourceInfo';
import SpecialistForum from './src/Specialist/SpecialistForum/';
import SpecialistCreatePost from './src/Specialist/SpecialistCreatePost/';
import SpecialistUpdatePost from './src/Specialist/SpecialistUpdatePost/';
import SpecialistAppointments from './src/Specialist/SpecialistAppointments/';
import CreateAppointments from './src/Specialist/CreateAppointments/';
import ViewSchedule from './src/Specialist/ViewSchedule/';
import SpecialistSettings from './src/Specialist/SpecialistSettings/';
import SpecialistEditProfile from './src/Specialist/SpecialistEditProfile/';
import SpecialistAdvertisements from './src/Specialist/SpecialistAdvertisements/';
import SpecialistCreateAds from './src/Specialist/SpecialistCreateAds/';

// System admin screens
import AdminHome from './src/Admin/AdminHome/';
import AdminHomePage from './src/Admin/AdminHomePage/';
import AdminResource from './src/Admin/AdminResource/';
import AdminForum from './src/Admin/AdminForum/';
import AdminSettings from './src/Admin/AdminSettings/';
import AdminEditProfile from './src/Admin/AdminEditProfile/';
import AdminAdvertisements from './src/Admin/AdminAdvertisements/';
import CreateAds from './src/Admin/CreateAds/';

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
                <Stack.Screen name="RegisterUser" component= {RegisterUser} options={{ headerShown: false }}/> 
                <Stack.Screen name="RegisterSpecialist" component= {RegisterSpecialist} options={{ headerShown: false }}/>
                <Stack.Screen name="Login" component= {Login} options={{ headerShown: false }}/>
                <Stack.Screen name="ForgetPw" component= {ForgetPw} options={{ headerShown: false }}/>

                {/* Unregistered User Screens */}
                <Stack.Screen name="HomePage" component= {HomePage} options={{ headerShown: false }}/>
                <Stack.Screen name="PreHome" component= {PreHome} options={{ headerShown: false }}/>
                <Stack.Screen name="DuringHome" component= {DuringHome} options={{ headerShown: false }}/>
                <Stack.Screen name="PostHome" component= {PostHome} options={{ headerShown: false }}/>
                <Stack.Screen name="Settings" component= {Settings} options={{ headerShown: false }}/>
                <Stack.Screen name="Resource" component= {Resource} options={{ headerShown: false }}/>
                <Stack.Screen name="Forum" component= {Forum} options={{ headerShown: false }}/>
                <Stack.Screen name="Appointments" component= {Appointments} options={{ headerShown: false }}/>

                {/* Registered User Screens */}
                <Stack.Screen name="RegisteredHome" component= {RegisteredHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserPreHome" component= {UserPreHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserDuringHome" component= {UserDuringHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserPostHome" component= {UserPostHome} options={{ headerShown: false }}/>
                <Stack.Screen name="UserResource" component= {UserResource} options={{ headerShown: false }}/>
                <Stack.Screen name="UserResourceInfo" component= {UserResourceInfo} options={{ headerShown: false }}/>
                <Stack.Screen name="UserForum" component= {UserForum} options={{ headerShown: false }}/>
                <Stack.Screen name="UserCreatePost" component= {UserCreatePost} options={{ headerShown: false }}/>
                <Stack.Screen name="UserUpdatePost" component= {UserUpdatePost} options={{ headerShown: false }}/>
                <Stack.Screen name="UserAppointments" component= {UserAppointments} options={{ headerShown: false }}/>
                <Stack.Screen name="UserBookAppointment" component= {UserBookAppointment} options={{ headerShown: false }}/>
                <Stack.Screen name="UserSettings" component= {UserSettings} options={{ headerShown: false }}/>
                <Stack.Screen name="UserEditProfile" component= {UserEditProfile} options={{ headerShown: false }}/>
                <Stack.Screen name="CycleHistory" component= {CycleHistory} options={{ headerShown: false }}/>
                <Stack.Screen name="LogPeriod" component= {LogPeriod} options={{ headerShown: false }}/>
                <Stack.Screen name="UpdatePeriodLog" component= {UpdatePeriodLog} options={{ headerShown: false }}/>
                <Stack.Screen name="WeightTracker" component= {WeightTracker} options={{ headerShown: false }}/>
                <Stack.Screen name="CreateWeightLog" component= {CreateWeightLog} options={{ headerShown: false }}/>
                <Stack.Screen name="UserPersonalisation" component= {UserPersonalisation} options={{ headerShown: false }}/>

                {/* Specialist User Screens */}
                <Stack.Screen name="SpecialistHome" component= {SpecialistHome} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistHomePage" component= {SpecialistHomePage} options={{ headerShown: false }}/>
                <Stack.Screen name="CreateResource" component= {CreateResource} options={{ headerShown: false }}/>
                <Stack.Screen name="UpdateResource" component= {UpdateResource} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistResource" component= {SpecialistResource} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistResourceInfo" component= {SpecialistResourceInfo} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistForum" component= {SpecialistForum} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistCreatePost" component= {SpecialistCreatePost} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistUpdatePost" component= {SpecialistUpdatePost} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistAppointments" component= {SpecialistAppointments} options={{ headerShown: false }}/>
                <Stack.Screen name="CreateAppointments" component= {CreateAppointments} options={{ headerShown: false }}/>
                <Stack.Screen name="ViewSchedule" component= {ViewSchedule} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistSettings" component= {SpecialistSettings} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistEditProfile" component= {SpecialistEditProfile} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistAdvertisements" component= {SpecialistAdvertisements} options={{ headerShown: false }}/>
                <Stack.Screen name="SpecialistCreateAds" component= {SpecialistCreateAds} options={{ headerShown: false }}/>

                {/* Admin Screens */}
                <Stack.Screen name="AdminHome" component= {AdminHome} options={{ headerShown: false }}/>
                <Stack.Screen name="AdminHomePage" component= {AdminHomePage} options={{ headerShown: false }}/>
                <Stack.Screen name="AdminResource" component= {AdminResource} options={{ headerShown: false }}/>
                <Stack.Screen name="AdminForum" component= {AdminForum} options={{ headerShown: false }}/>
                <Stack.Screen name="AdminSettings" component= {AdminSettings} options={{ headerShown: false }}/>
                <Stack.Screen name="AdminEditProfile" component= {AdminEditProfile} options={{ headerShown: false }}/>
                <Stack.Screen name="AdminAdvertisements" component= {AdminAdvertisements} options={{ headerShown: false }}/>
                <Stack.Screen name="CreateAds" component= {CreateAds} options={{ headerShown: false }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}