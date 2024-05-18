import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather } from '@expo/vector-icons';
import backendUrl from '../components/config.js';
import axios from 'axios';

const Forum = ({navigation}) => {
  //Variables to ask user for forum input
  const [forumDesc, setForumDesc] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [placeHolder, setPlaceHolder] = useState("Forum Description (e.g. Is it normal to gain 50kg during pregnancy)");
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [forumPost, setForumPost] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in", user);
        setCurrentUserEmail(user.email);
      }
      else {
        console.log("No user is logged in");
        setCurrentUserEmail('');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchForumPosts();
  }, []);

  const fetchForumPosts = async () => {
    try {
        const response = await axios.get(`${backendUrl}/getForumPosts`);
        if (response.data.status === "ok") {
            setForumPost(response.data.forumPosts);
        } else {
            console.error("Error fetching forum posts:", response.data.error);
        }
    } catch (error) {
        console.error("Error fetching forum posts:", error);
    }
};

  const addForumHandler = async() => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCreateForumPost = async () => {
    if (!forumDesc.trim()) {
        Alert.alert("Error", "You cannot create an empty post");
        return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        Alert.alert("Error", "You must be logged in to create a post");
        return;
    }

    try {
        const response = await axios.post(`${backendUrl}/createForumPost`, {
            user: currentUserEmail,
            description: forumDesc
        });

        console.log("Response from server:", response.data); // Log response data

        if (response.data.status === "ok") {
            Alert.alert("Success", "Forum post created successfully");
            setForumPost([...forumPost, response.data.forumPost]);
        } else {
            Alert.alert("Error", response.data.error || "Unknown error occurred");
        }
    } catch (error) {
        console.error("Error creating forum post:", error);
        Alert.alert("Error", "An error occurred while creating the forum post");
    }

    setShowModal(false);
    setPlaceHolder("Forum Description (e.g. Is it normal to gain 50kg during pregnancy)");
    setForumDesc('');
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

      {/* Display Current User's Email */}
      {currentUserEmail ? (
          <Text style={[styles.formText, { top: 50, left: 20 }]}>Logged in as: {currentUserEmail}</Text>
        ) : <Text style={[styles.formText, { top: 50, left: 20 }]}>You are not logged in</Text>}

      {/* Forum Posts */}
      <View style={{ marginTop: 20 }}>
        {forumPost.map((post) => (
          <View key={post._id} style={styles.forumPostContainer}>
            <Text style={styles.forumPostUser}>User: {post.user.email}</Text>
            <Text style={styles.forumPostDescription}>Description: {post.description}</Text>
            <Text style={styles.forumPostDate}>Date: {new Date(post.createdAt).toLocaleString()}</Text>
          </View>
        ))}
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
              placeholder={placeHolder}
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