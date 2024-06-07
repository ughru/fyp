import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import styles from './styles';
import { Feather } from '@expo/vector-icons';

const ModalStyle = ({ isVisible, onClose, navigation }) => {
  const handleNavigation = (screen) => {
    onClose(); // Close the modal
    navigation.navigate(screen); // Navigate to the specified screen
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
            <Text style={styles.modalTitle}>Join Us </Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color="black" onPress={onClose}/>
            </Pressable>
          </View>

          <Text style={[styles.formText, {marginBottom: 20, width: '80%', marginRight: 50}]}>To access more features, please register or login.</Text>
          <Pressable style={styles.button} onPress={() => handleNavigation('AccountType')}>
            <Text style={styles.text}>Register</Text>
          </Pressable>

          {/* Already have an account? Login */}
          <Pressable style={[styles.formText, { marginBottom: 20, alignSelf: 'center' }]} onPress={() => handleNavigation("Login")}>
            <Text>Already have an account? <Text style={styles.buttonText}>Login</Text></Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
};

export default ModalStyle;
