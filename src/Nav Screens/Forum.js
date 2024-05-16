import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather } from '@expo/vector-icons';

const Forum = ({navigation}) => {
  //Variables to ask user for forum input
  const [forumDesc, setForumDesc] = useState('');
  const [showModal, setShowModal] = useState('');

  const addForumHandler = async() => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCreateForumPost = async () => {
    // Add logic to create forum post using forumTitle and forumContent
    if(!forumDesc.trim()) {
      Alert.alert("Error", "You cannot create an empty post")
    }
    //setShowModal(false);
  };
 
  // Page Displays
  return (
    <Keyboard>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style= {[styles.pageTitle, {top: 80, left: 20}]}> Community Forum </Text>
      <View style={[styles.iconContainer, {top: 80, left: 330}]}>
        <TouchableOpacity onPress={addForumHandler}>
          <Feather name="edit" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Add Modal for Creating Forum Post */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={handleCloseModal}>

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Forum Post</Text>

            <TextInput
              multiline={true}
              style={[styles.forumDescStyle, { marginBottom: 10 }]}
              placeholder="Forum Description (e.g. Is it normal to gain 50kg during pregnancy)"
              value={forumDesc}
              onChangeText={setForumDesc} />

            <Pressable style={styles.modalButton} onPress={handleCreateForumPost}>
              <Text style={styles.modalButtonText}>Create Post</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={handleCloseModal}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </Keyboard>
  );
};

export default Forum;