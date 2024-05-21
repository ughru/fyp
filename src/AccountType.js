import React, { useEffect, useState } from 'react';
import { View, Text, Pressable} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import styles from './components/styles';

const AccountType = ({navigation}) => {
  const [selectedButton, setSelectedButton] = useState(null);

  const handlePress = (buttonType) => {
    setSelectedButton(buttonType);
  };

  const handleNext = () => {
    if (selectedButton === 'user') {
      navigation.navigate('RegisterUser');
    } else if (selectedButton === 'specialist') {
      navigation.navigate('RegisterSpecialist');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={[styles.questionText, {top: 250}]}> Choose Account Type </Text>

      <Pressable style={[styles.imgButton, selectedButton === 'user' && styles.selectedImgButton, {top: 320, left: 50}]} 
                 onPress={() => handlePress('user')}>
        <Text style={styles.text}> User </Text>
      </Pressable>

      <Pressable style={[styles.imgButton, selectedButton === 'specialist' && styles.selectedImgButton, {top: 320, left: 220}]} 
                 onPress={() => handlePress('specialist')}>
        <Text style={styles.text}> Specialist </Text>
      </Pressable>

      <Pressable style={[styles.button3, {top: 510, left: 240}]}  onPress={handleNext}>
        <View style={styles.buttonPosition}>
          <Text style={styles.text2}> Next </Text>
          <AntDesign name="right" size={12} color="black" />
        </View>
      </Pressable>

      <Pressable style={[styles.formText, { top: 580 }]} onPress={() => navigation.navigate("Login")}>
        <Text>Already have an account? <Text style={styles.buttonText}>Login</Text></Text>
      </Pressable>

    </View>
  );
};

export default AccountType;
