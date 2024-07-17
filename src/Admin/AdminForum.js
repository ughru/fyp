import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, TouchableHighlight, Modal, Pressable, Platform, Alert } from 'react-native';
import { Feather, Entypo, AntDesign, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import url from '../components/config.js';
import HTMLView from 'react-native-htmlview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const timeDifference = today - date;

    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hoursDifference = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesDifference = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const secondsDifference = Math.floor((timeDifference % (1000 * 60)) / 1000);

    if (daysDifference > 0) {
        return `${daysDifference}d`;
    } else if (hoursDifference > 0) {
        return `${hoursDifference}h`;
    } else if (minutesDifference > 0) {
        return `${minutesDifference}m`;
    } else if (secondsDifference > 0) {
        return `${secondsDifference}s`;
    } else {
        return 'Just now';
    }
};

const AdminForum = ({ navigation }) => {
    const [forumPosts, setForumPosts] = useState([]);
    const [visibleComments, setVisibleComments] = useState({});
    const [sortOrder, setSortOrder] = useState('newest');
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [activeButton, setActiveButton] = useState('General');
    const [userEmail, setEmail] = useState('');
    const [isCommentDropdownVisible, setCommentDropdownVisible] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);

    const fetchData = useCallback(async () => {
      try {
        const forumPostsResponse = await axios.get(`${url}/getForumPosts`);

        if (forumPostsResponse.data.status === 'ok') {
          const posts = forumPostsResponse.data.forumPosts;
          setForumPosts(posts);
        } else {
          console.error('Error fetching forum posts:', forumPostsResponse.data.error);
        }
    
        // Retrieve user's email from AsyncStorage
        const storedEmail = await AsyncStorage.getItem('user');
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          console.error('Error: User email not found in AsyncStorage.');
        }
      } catch (error) {
        console.error('Error fetching forum posts:', error);
      }
    }, []);    

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  useFocusEffect(
      useCallback(() => {
          fetchData();
      }, [fetchData])
  );

  const fetchComments = async (postID) => {
    try {
      const response = await axios.get(`${url}/getComments`, { params: { postID } });
      if (response.data.status === 'ok') {
        const comments = response.data.comments;
        setVisibleComments(prevState => ({
          ...prevState,
          [postID]: comments,
        }));
      } else {
        console.error('Error fetching comments:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const sortForumPosts = (posts, order) => {
      if (order === 'newest') {
          return posts.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      } else {
          return posts.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));
      }
  };

  const sortedPosts = sortForumPosts(forumPosts, sortOrder);

  const toggleCommentsVisibility = async (postID) => {
    if (visibleComments[postID]) {
      setVisibleComments(prevState => ({
        ...prevState,
        [postID]: false,
      }));
    } else {
      await fetchComments(postID);
    }
  };

  const toggleDropdown = (forumPost) => {
    setSelectedPost(forumPost);
    setDropdownVisible(!isDropdownVisible);
  };  

  const deletePost = async (postID) => {
    try {
        await axios.delete(`${url}/deletePost`, { params: { postID } });
        Alert.alert('Success', 'Post deleted successfully');
        fetchData();
        setDropdownVisible(false);
    } catch (error) {
        Alert.alert('Error', 'Failed to delete post');
        console.error('Error deleting post:', error);
    }
  };
  
  const handleSelection = (action) => {
    setDropdownVisible(false);
    if (action === 'edit') {
        navigation.navigate('UserUpdatePost', { postID: selectedPost.postID});
    } else if (action === 'delete') {
      if (Platform.OS === 'web') {
        if (window.confirm('Are you sure you want to delete this post?')) {
          deletePost(selectedPost.postID);
        }
      } else {
        Alert.alert(
          'Deletion of Post',
          'Are you sure you want to delete this post?',
          [
              { text: 'Cancel'},
              { text: 'Delete', onPress: () => deletePost(selectedPost.postID) }
          ],
          { cancelable: false }
        );
      }
    }
};

const toggleCommentDropdown = (comment , forumpost) => {
  setSelectedComment(comment);
  setSelectedPost(forumpost);
  setCommentDropdownVisible(!isCommentDropdownVisible);
};

const handleCommentSelection = (action) => {
  setCommentDropdownVisible(false);
  if (action === 'delete') {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this comment?')) {
        deleteComment(selectedPost.postID, selectedComment._id);
      }
    } else {
      Alert.alert(
        'Deletion of Comment',
        'Are you sure you want to delete this comment?',
        [
            { text: 'Cancel'},
            { text: 'Delete', onPress: () => deleteComment(selectedPost.postID, selectedComment._id)}
        ],
        { cancelable: false }
      );
    }
  } 
};

const deleteComment = async (postID, commentID) => {
  try {
    const response = await axios.delete(`${url}/deleteComment`, { params: { postID, commentID } });

    if (response.data.status === 'ok') {
      Alert.alert('Success', 'Comment deleted successfully');
      // Remove the deleted comment from visibleComments state
      setVisibleComments(prevState => ({
        ...prevState,
        [postID]: prevState[postID].filter(comment => comment._id !== commentID),
      }));
      setCommentDropdownVisible(false);
      
      setForumPosts(forumPosts.map(post => {
        if (post.postID === postID) {
          post.commentCount -= 1;
        }
        return post;
      }))
    } else {
      console.error('Failed to delete comment:', response.data.error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    Alert.alert('Error', 'Failed to delete comment');
  }
};

const handleCategoryButtonClick = (category) => {
  setActiveButton(category);
};

  return (
  <Keyboard>
  <ScrollView style={styles.container5}>
    <View style = {[styles.container4,  Platform.OS!=="web"&& {paddingTop:50}, {marginBottom: 20}]}>
      <View style={[styles.container2, { paddingTop: 20, paddingHorizontal: 20 }]}>
        <Text style={styles.pageTitle}>Community Forum</Text>
      </View>
    </View>

      <View style={[styles.container4, { marginBottom: 20, paddingHorizontal: 20 }]}>
        {/* Category Filter Buttons */}
        <View style={[styles.buttonContainer]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
                onPress={() => handleCategoryButtonClick('General')}
                style={activeButton === 'General' ? styles.categoryBtnActive : styles.categoryBtn}
            >
                <Text style={styles.text}>General</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleCategoryButtonClick('Ask Specialist')}
                style={activeButton === 'Ask Specialist' ? styles.categoryBtnActive : styles.categoryBtn}
            >
                <Text style={styles.text}>Ask Specialist</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort section */}
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          <Text style={[styles.text, { marginRight: 10 }]}>Sort by:</Text>
          <RNPickerSelect
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value)}
            items={[
                { label: 'Newest', value: 'newest' },
                { label: 'Oldest', value: 'oldest' },
            ]}
          />
          {Platform.OS !== 'web' && 
            <View style={[styles.iconContainer, { marginLeft: 10 }]}>
            <AntDesign name="down" size={16} color="black" />
          </View>
          }
        </View>
      </View>

      {/* Posts + comments */}
      <View style={[styles.container3, {paddingHorizontal: 20}]}>
      {sortedPosts.map((post, index) => {
      if (post.category === activeButton) {
        return (
        <View key={index} style={styles.forumPostContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.text3, { flex: 1, margin: 10 }]}>{post.userInfo.firstName} {post.userInfo.lastName}</Text>
            <Text style={styles.titleNote}>{formatDate(post.dateCreated)}</Text>
            <TouchableHighlight
              style={[styles.iconContainer, {marginLeft: 15}]}
              onPress={() => toggleDropdown(post)}
              underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}>
              <Entypo name="dots-three-vertical" size={16} />
            </TouchableHighlight>
          </View>

          {/* Modal for user actions - edit, delete, report */}
          <Modal transparent={true} animationType="fade" visible={isDropdownVisible} onRequestClose={() => setDropdownVisible(false)}>
          <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
            <View style={{ width: '90%', backgroundColor: '#E3C2D7', borderRadius: 10, padding: 20 }}>
              <Pressable style={{ marginLeft: 'auto' }}>
                <Feather name="x" size={24} color="black" onPress={() => setDropdownVisible(false)} />
              </Pressable>
              {/* Selections */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <MaterialIcons name="delete-outline" size={24} color="black" />
                  <Pressable style={{ marginLeft: 10 }} onPress={() => handleSelection('delete')}>
                      <Text style={styles.text}>Delete Post</Text>
                  </Pressable>
              </View>
            </View>
          </View>
          </Modal>

          <HTMLView style={{ margin: 10 }} stylesheet={{ div: styles.text }} value={post.description} />

          {/* Comments */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TouchableHighlight
              underlayColor={Platform.OS === 'web' ? 'transparent' : '#cccccc'}
              style={styles.commentsIcon}
              onPress={() => toggleCommentsVisibility(post.postID)}
            >
              <Feather name="message-circle" size={24} color="black" style={styles.commentsIcon} />
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={Platform.OS === 'web' ? 'transparent' : '#cccccc'}
              style={styles.commentsIcon}
              onPress={() => toggleCommentsVisibility(post.postID)}
            >
              {post.commentCount === 0 ? (
                <Text style={styles.formText}>No replies yet</Text>
              ) : post.commentCount === 1 ? (
                <Text style={styles.formText}>view {post.commentCount} reply</Text>
              ) : (
                <Text style={styles.formText}>view {post.commentCount} replies</Text>
              )}
            </TouchableHighlight>
          </View>
          <View>
          {visibleComments[post.postID] && visibleComments[post.postID].map((comment, commentIndex) => (
            <View key={commentIndex} style={[styles.container4, {marginLeft: 20, marginBottom: 20, marginRight:10}]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={[styles.text3, { flex: 1, marginBottom: 10 }]}>{comment.userInfo.firstName} {comment.userInfo.lastName}</Text>
                <Text style={[styles.formText, {marginBottom: 8, marginLeft: 20}]}>{formatDate(comment.date)} </Text>
                <TouchableHighlight
                  style={[styles.iconContainer, {marginBottom: 8, marginLeft: 15}]}
                  underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}
                  onPress={() => toggleCommentDropdown(comment, post)}>
                  <Entypo name="dots-three-vertical" size={16} />
                </TouchableHighlight>
              </View>
              <Text style={[styles.text]}>{comment.userComment}</Text>
            </View>
          ))}
          </View>
        </View>
        );
      }
        return null;
      })}
      </View>

      {/* Comment Modal */}
      {isCommentDropdownVisible && selectedComment && (
      <Modal
        transparent={true}
        animationType="fade"
        visible={isCommentDropdownVisible}
        onRequestClose={() => setCommentDropdownVisible(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
          <View style={{ width: '90%', backgroundColor: '#E3C2D7', borderRadius: 10, padding: 20 }}>
            <Pressable style={{ marginLeft: 'auto' }} onPress={() => setCommentDropdownVisible(false)}>
              <Feather name="x" size={24} color="black" />
            </Pressable>
            {/* Selections */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <MaterialIcons name="delete-outline" size={24} color="black" />
              <Pressable style={{ marginLeft: 10 }} onPress={() => handleCommentSelection('delete')}>
                <Text style={styles.text}>Delete Comment</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      )}
    </ScrollView>
    </Keyboard>
    );
};

export default AdminForum;