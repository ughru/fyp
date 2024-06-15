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
      <View style = {[styles.container3, {justifyContent: 'center', alignItems: 'center'}]}>
      {/* Back button */}
      <View style = {[{ flexDirection: 'row', alignItems: 'center', marginBottom: 80, marginRight: 280}]}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={() => navigation.goBack()}>
            <Text style={styles.text}> back </Text>
          </Pressable>
      </View>
    </View>

    <View style={styles.container}>
      <Text style={[styles.questionText, {marginBottom: 40, alignSelf: 'center'}]}> Choose Account Type </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
                     width: '100%', marginBottom: 40}}>
        <Pressable style={[styles.imgButton, { marginLeft: 20 }, selectedButton === 'user' && styles.selectedImgButton]} 
                  onPress={() => handlePress('user')}>
          <Text style={styles.text}> User </Text>
        </Pressable>

        <Pressable style={[styles.imgButton, { marginRight: 20 }, selectedButton === 'specialist' && styles.selectedImgButton]} 
                  onPress={() => handlePress('specialist')}>
          <Text style={styles.text}> Specialist </Text>
        </Pressable>
      </View>

      <Pressable style={[styles.button3, {marginBottom: 40, marginLeft: 200}]}  onPress={handleNext}>
        <View style={styles.buttonPosition}>
          <Text style={styles.text2}> Next </Text>
          <AntDesign name="right" size={12} color="black" />
        </View>
      </Pressable>

      <Pressable style={[styles.formText, {alignSelf: 'center'}]} onPress={() => navigation.navigate("Login")}>
        <Text>Already have an account? <Text style={styles.buttonText}>Login</Text></Text>
      </Pressable>
      </View>
    </View>
  );
};

export default AccountType;
