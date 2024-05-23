import React from 'react';
import { View, Text, Pressable, Image, StyleSheet} from 'react-native';
import styles from './components/styles';

const Welcome = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={[styles.textTitle, {top: 395, left: 87}]}> WELCOME TO BLOOM </Text>

      {/* Button */}
      <Pressable style={[styles.button, {top: 446}]} onPress={() =>navigation.navigate("Personalisation")}>
        <Text style={styles.text}> Get Started </Text>
      </Pressable>
    </View>
  );
};

export default Welcome;
