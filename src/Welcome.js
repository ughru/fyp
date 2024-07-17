import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { storage } from '../firebaseConfig'; 
import styles from './components/styles';

const Welcome = ({ navigation }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
       const url = await storage.ref('miscellaneous/logo.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, []);

  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      {/* Display Image */}
      {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200, marginBottom: 20 }} />}

      {/* Title */}
      <Text style={styles.textTitle}>WELCOME TO BLOOM</Text>

      {/* Button */}
      <Pressable style={[styles.button, {alignSelf: 'center'}]} onPress={() => navigation.navigate("Personalisation")}>
        <Text style={styles.text}>Get Started</Text>
      </Pressable>

      <Pressable style={[styles.formText, { marginBottom: 20, alignSelf: 'center' }]} onPress={() => navigation.navigate("RegisterSpecialist", { origin: 'RegisterSpecialist' })}>
        <Text style= {styles.text}>Joining as a <Text style= {[styles.text, {fontWeight: 'bold'}]}>SPECIALIST</Text>? <Text style={styles.buttonText}>Sign up</Text></Text>
      </Pressable>
    </View>
  );
};

export default Welcome;