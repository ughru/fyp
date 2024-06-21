import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import { Feather } from '@expo/vector-icons';
import backendUrl from '../components/config.js';
import axios from 'axios';
import Entypo from 'react-native-vector-icons/Entypo';
import { Picker } from '@react-native-picker/picker';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = today - date;

  // Convert time difference from milliseconds to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  //return date.toLocaleDateString();
  if(daysDifference <= 0){
    return 0;
  }
  else{
    return daysDifference;
  }
};

const Forum = ({ navigation }) => {
  const [forumDesc, setForumDesc] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [placeHolder, setPlaceHolder] = useState("Forum Description (e.g. Is it normal to gain 50kg during pregnancy)");
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [forumPost, setForumPost] = useState([]);
  const [forumPostsWithComments, setForumPostsWithComments] = useState([]);
  const [visibleComments, setVisibleComments] = useState({});
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        setCurrentUserEmail('');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchForumPosts();
  }, []);

  useEffect(() => {
    if (forumPost.length > 0) {
      countComments();
    }
  }, [forumPost]);

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

  const fetchComments = async (postID) => {
    try {
      const response = await axios.get(`${backendUrl}/getComments`, { params: { postID } });
      if (response.data.status === "ok") {
        setVisibleComments(prevState => ({
          ...prevState,
          [postID]: response.data.comments,
        }));
      } else {
        console.error("Error fetching comments:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const addForumHandler = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to create a post");
      return;
    }
  };

  const reportForumHandler = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if(!currentUser){
      Alert.alert("Error", "You must be logged in to report a post");
      return;
    }
  }

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

    setShowModal(false);
    setPlaceHolder("Forum Description (e.g. Is it normal to gain 50kg during pregnancy)");
    setForumDesc('');
  };

  const countComments = () => {
    const postsWithComments = forumPost.map((post) => {
      //const commentCount = hardcodedComments.filter(comment => comment.forumPostID === post.forumPostID).length;
      const commentCount = post.comments.length;
      return { ...post, commentCount };
    });
    setForumPostsWithComments(postsWithComments);
  };

  const sortForumPosts = (posts, order) => {
    if (order === 'newest') {
      return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      return posts.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  const sortedPosts = sortForumPosts(forumPostsWithComments, sortOrder);

  const toggleCommentsVisibility = (postID) => {
    if (visibleComments[postID]) {
      setVisibleComments(prevState => ({
        ...prevState,
        [postID]: false,
      }));
    } else {
      fetchComments(postID);
    }
  };

  const handleAddComment = async(postID) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to comment");
      return;
    }

    setCommentText('');
  };

  return (
    <Keyboard>
<<<<<<< Updated upstream
    <ScrollView contentContainerStyle={styles.container}>
      <Text style= {[styles.pageTitle, {top: 80, left: 20}]}> Community Forum </Text>
      <View style={[styles.iconContainer, {top: 80, left: 330}]}>
        <Feather name="edit" size={24} color="black" />
=======
      <ScrollView style={styles.container5}>
        <View style={styles.container4}>
          <View style={[styles.container2, { paddingTop: 20, paddingHorizontal: 20 }, Platform.OS!=="web"&& {paddingTop:50}]}>
          <Text style={styles.pageTitle}> Community Forum </Text>
          </View>

        <View style={[styles.adImageContainer, { width: "100%", alignItems: 'center' }]}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.adImage} />}
        </View>
>>>>>>> Stashed changes
      </View>
    </ScrollView>
    </Keyboard>
  );
};

export default Forum;
