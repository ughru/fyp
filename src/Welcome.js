import React from 'react';
import { View, Text, Pressable } from 'react-native';
import styles from './components/styles';

const Welcome = ({ navigation }) => {
  return (
    <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
      {/* Title */}
      <Text style={styles.textTitle}>WELCOME TO BLOOM</Text>

      {/* Button */}
      <Pressable style={styles.button} onPress={() => navigation.navigate("Personalisation")}>
        <Text style={styles.text}>Get Started</Text>
      </Pressable>
    </View>
  );
};

export default Welcome;
