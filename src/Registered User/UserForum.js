/*
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, TouchableOpacity, Alert, Modal, TouchableHighlight, Image } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
  return today;
};

const Forum = ({navigation}) => {
  //Variables to ask user for forum input
  const [forumDesc, setForumDesc] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [placeHolder, setPlaceHolder] = useState("Forum Description (e.g. Is it normal to gain 50kg during pregnancy)");
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [forumPost, setForumPost] = useState([]);
  const [forumPostsWithComments, setForumPostsWithComments] = useState([]);
  const [visibleComments, setVisibleComments] = useState([]);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

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

  useEffect(() => {
    // Function to count comments for each forum post
    const countComments = () => {
      const postsWithComments = hardcodedPosts.map(post => {
        const commentCount = hardcodedComments.filter(comment => comment.forumPostID === post.forumPostID).length;
        return { ...post, commentCount };
      });
      setForumPostsWithComments(postsWithComments);
    };

    // Call countComments function
    countComments();
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

//Sort post
const sortForumPosts = (posts, order) => {
  if (order === 'newest') {
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    return posts.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
};

const sortedPosts = sortForumPosts(forumPostsWithComments, sortOrder);

// Hardcoded forum posts
const hardcodedPosts = [
  {
    forumPostID: 1,
    user: 'John Wick',
    description: 'How many times a week should I exercise during pregnancy',
    date: '22/02/2024'
  },
  {
    forumPostID: 2,
    user: 'Jane Doe',
    description: 'Is it normal to feel very tired during the first trimester?',
    date: '15/03/2024'
  },
  {
    forumPostID: 3,
    user: 'Alice Smith',
    description: 'What are the best foods to eat while pregnant?',
    date: '10/04/2024'
  },
  {
    forumPostID: 4,
    user: 'James Blake',
    description: 'What are the best foods to eat while pregnant?',
    date: '10/10/2024'
  },
  {
    forumPostID: 5,
    user: 'Ash Ketchum',
    description: 'What are the best foods to eat while pregnant?',
    date: '10/08/2024'
  }
];

const hardcodedComments = [
  { commentID: 1, forumPostID: 1, user: 'Alice', text: 'You should exercise at least 3 times a week.' },
  { commentID: 2, forumPostID: 1, user: 'Bob', text: 'Consult your doctor for personalized advice.' },
  { commentID: 3, forumPostID: 2, user: 'Eve', text: 'Yes, fatigue is common in the first trimester.' },
  { commentID: 4, forumPostID: 3, user: 'John', text: 'Leafy greens and lean proteins are great choices.' },
  { commentID: 5, forumPostID: 3, user: 'Mary', text: 'Avoid raw fish and unpasteurized dairy products.' }
  // Add more comments as needed
];

// Function to toggle visibility of comments
const toggleCommentsVisibility = (postID) => {
  setVisibleComments(prevState => {
    const updatedState = { ...prevState };
    updatedState[postID] = !updatedState[postID];
    return updatedState;
  });
};

// Function to handle report
const handleReportPost = async (postID) => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to report a post");
      return;
  }

  try {
    const response = await axios.post(`${backendUrl}/reportPost`, {
      postID: postID,
      reporter: currentUserEmail,
    });

    if (response.data.status === "ok") {
      Alert.alert("Success", "Post reported successfully");
    } else {
      Alert.alert("Error", response.data.error || "Unknown error occurred");
    }
  } catch (error) {
    console.error("Error reporting post:", error);
    Alert.alert("Error", "An error occurred while reporting the post");
  }
  setReportModalVisible(false);
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
      {currentUserEmail ? (
          <Text style={[styles.formText, { top: 50, left: 20 }]}>Logged in as: {currentUserEmail}</Text>
        ) : <Text style={[styles.formText, { top: 50, left: 20 }]}>You are not logged in</Text>}

      <View style={styles.adImageContainer}>
        <Image source={require('../../assets/ad/pregnancyAd1.jpeg')} style={styles.adImage} />
      </View>

      <View style={styles.sortForumContainer}>
          <Text style={{ marginRight: 10 }}>Sort by:</Text>
          <Picker
            selectedValue={sortOrder}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue) => setSortOrder(itemValue)}
          >
            <Picker.Item label="Newest" value="newest" />
            <Picker.Item label="Oldest" value="oldest" />
          </Picker>
      </View>

      <View style={styles.forumDescriptionBox}>
          {forumPostsWithComments.map((post, index) => (
          //{hardcodedPosts.map((post, index) => (
            <View key={index} style={styles.forumPostContainer}>
              <View style={styles.forumRow}>
                <Text style={styles.forumPostUser}>User: {post.user}</Text>

                <TouchableHighlight style={styles.threeDotVert} onPress={() => { setReportModalVisible(true); setPostToReport(post.forumPostID); }}>
                  <Entypo name='dots-three-vertical' size={10}/>
                </TouchableHighlight>
              </View>

              <Text style={styles.forumPostDescription}>Description: {post.description}</Text>
              <Text style={styles.forumPostDate}>Date: {formatDate(post.date)}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableHighlight underlayColor={'#cccccc'} style={styles.commentsIcon} onPress={() => toggleCommentsVisibility(post.forumPostID)}>
                <Feather name="message-circle" size={24} color="black" style={styles.commentsIcon}/>
                </TouchableHighlight>

                <Text style={styles.commentCount}>{post.commentCount}</Text>

              </View>

              {visibleComments[post.forumPostID] && (
                <View style={styles.commentsContainer}>
                  {hardcodedComments
                    .filter(comment => comment.forumPostID === post.forumPostID)
                    .map((comment, idx) => (
                      <View key={idx} style={styles.commentItem}>
                        <Text style={styles.commentUser}>User: {comment.user}</Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    ))}
                </View>
              )}
            </View>
          ))}
      </View>

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

      <Modal
          animationType="slide"
          transparent={true}
          visible={reportModalVisible}
          onRequestClose={() => setReportModalVisible(false)}>

          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Report Post</Text>
              <Text>Are you sure you want to report this post?</Text>
              <Pressable style={styles.modalButton} onPress={() => handleReportPost(postToReport)}>
                <Text style={styles.modalButtonText}>Yes, Report</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={() => setReportModalVisible(false)}>
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
*/
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, TouchableOpacity, Alert, Modal, TouchableHighlight, Image } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
    return daysDifference
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
        description: forumDesc,
      });

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

  const hardcodedComments = [
    { commentID: 1, forumPostID: 1, user: 'Alice', text: 'You should exercise at least 3 times a week.' },
    { commentID: 2, forumPostID: 1, user: 'Bob', text: 'Consult your doctor for personalized advice.' },
    { commentID: 3, forumPostID: 2, user: 'Eve', text: 'Yes, fatigue is common in the first trimester.' },
    { commentID: 4, forumPostID: 3, user: 'John', text: 'Leafy greens and lean proteins are great choices.' },
    { commentID: 5, forumPostID: 3, user: 'Mary', text: 'Avoid raw fish and unpasteurized dairy products.' },
  ];

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

  const handleReportPost = async (postID) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to report a post");
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/reportPost`, {
        postID: postID,
        currentUser: currentUserEmail,
      });

      if (response.data.status === "ok") {
        console.log("Success", postID)
        Alert.alert("Success", "Post reported successfully");
      } else {
        Alert.alert("Error", response.data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error reporting post:", postID);
      Alert.alert("Error", "An error occurred while reporting the post");
    }
    setReportModalVisible(false);
  };

  const handleAddComment = async(postID) => {
    console.log("Adding comment to postID: ", postID)
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to comment");
      return;
    }

    if (!commentText.trim()){
      Alert.alert("Error", "You cannot add an empty comment");
      return;
    }

    try{
      const response = await axios.post(`${backendUrl}/addComment`, {
        postID: postID,
        comments: [{currentUserEmail, commentText}]
        //user: currentUserEmail,
        //text: commentText
      });

      if(response.data.status == 'ok'){
        Alert.alert("Success", "Comment added successfully");
        fetchForumPosts(postID);
      }

      else{
        Alert.alert("Error", response.data.error || "Unknown error occurred");
      }
    } catch(error){
      console.error("Error adding comment: ", error);
      Alert.alert("Error", "An error occurred while adding comment")
    }

    setCommentText('');
  };
  
  return (
    <Keyboard>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.pageTitle, { top: 80, left: 20 }]}> Community Forum </Text>
        <View style={[styles.iconContainer, { top: 80, left: 330 }]}>
          <TouchableOpacity onPress={addForumHandler}>
            <Feather name="edit" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {currentUserEmail ? (
          <Text style={[styles.formText, { top: 50, left: 20 }]}>Logged in as: {currentUserEmail}</Text>
        ) : <Text style={[styles.formText, { top: 50, left: 20 }]}>You are not logged in</Text>}

        <View style={styles.adImageContainer}>
          <Image source={require('../../assets/ad/pregnancyAd1.jpeg')} style={styles.adImage} />
        </View>

        <View style={styles.sortForumContainer}>
          <Text style={{ marginRight: 10 }}>Sort by:</Text>
          <Picker
            selectedValue={sortOrder}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue) => setSortOrder(itemValue)}
          >
            <Picker.Item label="Newest" value="newest" />
            <Picker.Item label="Oldest" value="oldest" />
          </Picker>
        </View>

        <View style={styles.forumDescriptionBox}>
          {sortedPosts.map((post, index) => (
            <View key={index} style={styles.forumPostContainer}>
              {/*<Text style={styles.forumPostID}>Post ID: {post.postID}</Text>*/}
              <View style={styles.forumRow}>
                <Text style={styles.forumPostUser}>User: {post.user}</Text>
                <Text style={styles.forumPostDate}>{formatDate(post.date)}d</Text>
                <TouchableHighlight style={styles.threeDotVert} onPress={() => { setPostToReport(post.postID) && setReportModalVisible(true) }}>
                  <Entypo name='dots-three-vertical' size={10} />
                </TouchableHighlight>
              </View>

              <Text style={styles.forumPostDescription}>Description: {post.description}</Text>
              

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableHighlight underlayColor={'#cccccc'} style={styles.commentsIcon} onPress={() => toggleCommentsVisibility(post.postID)}>
                  <Feather name="message-circle" size={24} color="black" style={styles.commentsIcon} />
                </TouchableHighlight>

                <TouchableHighlight underlayColor={'#cccccc'} style={styles.commentsIcon} onPress={() => toggleCommentsVisibility(post.postID)}>
                <Text style={styles.commentCount}>view {post.commentCount} replies</Text>
                </TouchableHighlight>
              </View>

              {visibleComments[post.postID] && (
                <View style={styles.commentsContainer}>
                  {visibleComments[post.postID].map((comment, index) => (
                      <View key={index} style={styles.commentItem}>
                        <Text style={styles.commentUser}>User: {comment.user}</Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    ))}
                </View>
              )}

              <View style={styles.addForumComment}>
                <TextInput
                  style={styles.addCommentInput}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity
                  style={styles.uploadCommentButton}
                  onPress={() => handleAddComment(post.postID)}
                >
                  <Feather name='upload'/>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          
        </View>  

        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Forum Post</Text>

              <TextInput
                multiline={true}
                style={[styles.forumDescStyle, { marginBottom: 10 }]}
                placeholder={placeHolder}
                value={forumDesc}
                onChangeText={setForumDesc}
              />

              <Pressable style={styles.modalButton} onPress={handleCreateForumPost}>
                <Text style={styles.modalButtonText}>Create Post</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={handleCloseModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={reportModalVisible}
          onRequestClose={() => setReportModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Report Post</Text>
              <Text>Are you sure you want to report this post?</Text>
              <Pressable style={styles.modalButton} onPress={() => handleReportPost(postToReport)}>
                <Text style={styles.modalButtonText}>Yes, Report</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={() => setReportModalVisible(false)}>
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

