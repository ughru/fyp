import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TextInput, TouchableOpacity, TouchableHighlight, Modal, Pressable, Image, Platform, Alert, ActivityIndicator } from 'react-native';
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

const showAlert = (title, message, onPress) => {
  if (Platform.OS === 'web') {
      // Web-specific alert
      window.alert(`${title}\n${message}`);
  } else {
      // Native alert
      Alert.alert(title, message, [{ text: 'OK', onPress }], { cancelable: false });
  }
};

const SpecialistForum = ({ navigation }) => {
  const [forumPosts, setForumPosts] = useState([]);
  const [visibleComments, setVisibleComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [sortOrder, setSortOrder] = useState('newest');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [userEmail, setEmail] = useState('');
  const [isCommentDropdownVisible, setCommentDropdownVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [inputHeight, setInputHeight] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false); 
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
        showAlert('Success', 'Post deleted successfully');
        fetchData();
        setDropdownVisible(false);
      } catch (error) {
        showAlert('Error', 'Failed to delete post');
        console.error('Error deleting post:', error);
      }
  };

  const handleSelection = (action) => {
      setDropdownVisible(false);
      if (action === 'edit') {
          navigation.navigate('SpecialistUpdatePost', { postID: selectedPost.postID });
      } else if (action === 'delete') {
          if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this post?')) {
                deletePost(selectedPost.postID);
            }
          } else {
              showAlert(
                  'Deletion of Post',
                  'Are you sure you want to delete this post?',
                  () => deletePost(selectedPost.postID)
              );
          }
      } 
  };

  const toggleCommentDropdown = (comment, forumpost) => {
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
            { text: 'Cancel' },
            { text: 'Delete', onPress: () => deleteComment(selectedPost.postID, selectedComment._id) }
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
        showAlert('Success', 'Comment deleted successfully');
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
        }));
      } else {
        console.error('Failed to delete comment:', response.data.error);
        showAlert('Error', 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      showAlert('Error', 'Failed to delete comment');
    }
  };

  const handleCommentTextChange = (postID, text) => {
    setCommentText((prevState) => ({
      ...prevState,
      [postID]: text,
    }));
  };

  const handleInputHeightChange = (postID, height) => {
    setInputHeight((prevState) => ({
      ...prevState,
      [postID]: height,
    }));
  };

  const addComment = async (postID, userEmail, userComment) => {
    try {
      if (!commentText[postID]?.trim()) {
        setCommentErrors((prevState) => ({
          ...prevState,
          [postID]: '* Comment cannot be empty',
        }));
        return;
      }

      const response = await axios.post(`${url}/addComment`, {
        postID,
        userEmail,
        userComment,
        dateCreated: new Date(),
      });

      if (response.data.status === 'ok') {
        setCommentText((prevState) => ({
          ...prevState,
          [postID]: '', // Clear comment after success
        }));

        // Clear error for this post ID
        setCommentErrors((prevState) => ({
          ...prevState,
          [postID]: null,
        }));

        // Fetch updated comments for the post
        await fetchComments(postID);

        // Update comment count for the post
        setForumPosts(forumPosts.map(post => {
          if (post.postID === postID) {
            post.commentCount += 1;
          }
          return post;
        }))
      } else {
        console.error('Failed to add comment:', response.data.error);
        showAlert('Error', 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showAlert('Error', 'Failed to add comment');
    }
  };

  return (
  <Keyboard>
  <ScrollView style={styles.container5}>
    <View style = {[styles.container4,  Platform.OS!=="web"&& {paddingTop:50}]}>
    <View style={[styles.container2, { paddingTop: 20, paddingHorizontal: 20, marginBottom: 20 }]}>
        <Text style={styles.pageTitle}>Community Forum</Text>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate("SpecialistCreatePost")}>
            <Feather name="edit" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>

    <View style={[styles.container4, { marginBottom: 20, paddingHorizontal: 20 }]}>
      {/* Category Filter Buttons */}
      <View style={[styles.buttonContainer, { marginBottom: 20 }]}>
        <View style={styles.categoryBtnActive}>
            <Text style={styles.text}>Ask Specialist</Text>
        </View>
      </View>

      {/* Sort section */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
        <Text style={[styles.text, { marginRight: 10 }]}>Sort by:</Text>
        <RNPickerSelect
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value)}
          items={[
              { label: 'Newest', value: 'newest' },
              { label: 'Oldest', value: 'oldest' },
          ]}
          style={{
          inputIOS: styles.text,
          inputAndroid: styles.text,
          inputWeb: styles.text,
          }}
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
    {loading ? (
    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
      <Text>Loading posts...</Text>
      <ActivityIndicator size="large" color="#E3C2D7" />
    </View>
    ) : (
    sortedPosts.map((post, index) => {
    if (post.category === "Ask Specialist") {
      return (
      <View key={index} style={styles.forumPostContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.text3, { flex: 1, margin: 10 }]}>{post.userInfo.firstName} {post.userInfo.lastName}</Text>
          <Text style={[styles.titleNote, {paddingRight: 10}]}>{formatDate(post.dateCreated)}</Text>
          {post.userEmail === userEmail && (
          <TouchableHighlight
            style={[styles.iconContainer]}
            onPress={() => toggleDropdown(post)}
            underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}>
            <Entypo name="dots-three-vertical" size={16} />
          </TouchableHighlight>
          )}
        </View>

        {/* Modal for user actions - edit, delete, report */}
        <Modal transparent={true} animationType="fade" visible={isDropdownVisible} onRequestClose={() => setDropdownVisible(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
          <View style={{ width: '90%', backgroundColor: '#E3C2D7', borderRadius: 10, padding: 20 }}>
            <Pressable style={{ marginLeft: 'auto' }}>
              <Feather name="x" size={24} color="black" onPress={() => setDropdownVisible(false)} />
            </Pressable>
            {/* Selections */}
            {selectedPost && selectedPost.userEmail === userEmail ? (
              <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Feather name="edit" size={22} color="black" />
                  <Pressable style={{ marginLeft: 10 }} onPress={() => handleSelection('edit')}>
                      <Text style={styles.text}>Edit Post</Text>
                  </Pressable>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <MaterialIcons name="delete-outline" size={24} color="black" />
                  <Pressable style={{ marginLeft: 10 }} onPress={() => handleSelection('delete')}>
                      <Text style={styles.text}>Delete Post</Text>
                  </Pressable>
              </View>
              </>
            ) : (
              //<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              //    <MaterialIcons name="report" size={24} color="black" />
              //    <Pressable style={{ marginLeft: 10 }} onPress={() => handleSelection('report')}>
              //        <Text style={styles.text}>Report Post</Text>
              //    </Pressable>
              //</View>
              null
            )}
          </View>
        </View>
        </Modal>

        <HTMLView style={{ margin: 10 }} stylesheet={{ div: styles.text }} value={post.description} />

        {/* Comments */}
        <View>
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
            {visibleComments[post.postID] && visibleComments[post.postID].map((comment, commentIndex) => (
              <View key={commentIndex} style={[styles.container4, { marginLeft: 20, marginBottom: 20, marginRight: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={[styles.text3, {flex: 1, marginBottom: 10 }]}>{comment.userInfo.firstName} {comment.userInfo.lastName}</Text>
                  <Text style={[styles.formText, { marginBottom: 8, paddingRight: 10 }]}>{formatDate(comment.date)} </Text>
                  {comment.userEmail === userEmail && (
                  <TouchableHighlight
                    style={[styles.iconContainer, {marginBottom: 8 }]}
                    underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}
                    onPress={() => toggleCommentDropdown(comment , post)}>
                    <Entypo name="dots-three-vertical" size={16} />
                  </TouchableHighlight>
                  )}
                </View>
                <Text style={[styles.text]}>{comment.userComment}</Text>
            </View>
            ))}
        </View>
        <View>{commentErrors[post.postID] && <Text style={styles.error}>{commentErrors[post.postID]}</Text>}</View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.search, { paddingBottom: 10 }]}>
            <TextInput
              style={[styles.input4, {height: Math.max(40, inputHeight[post.postID] || 40 + 20)}]}
              placeholder="Add a comment..."
              value={commentText[post.postID] || ''}
              onChangeText={(text) => handleCommentTextChange(post.postID, text)}
              multiline
              onContentSizeChange={(e) => handleInputHeightChange(post.postID, e.nativeEvent.contentSize.height)}
            />
          </View>
          <TouchableOpacity style={[styles.iconContainer, { marginLeft: 10, paddingBottom: 10 }]}
            onPress={() => addComment(post.postID, userEmail, commentText[post.postID])}>
            <Feather name="upload" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      );
    }
      return null;
    }))}
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
                {selectedComment && selectedComment.userEmail === userEmail ? (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                      <MaterialIcons name="delete-outline" size={24} color="black" />
                      <Pressable style={{ marginLeft: 10 }} onPress={() => handleCommentSelection('delete')}>
                        <Text style={styles.text}>Delete Comment</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  //<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  //  <MaterialIcons name="report" size={24} color="black" />
                  //  <Pressable style={{ marginLeft: 10 }} onPress={() => handleCommentSelection('report')}>
                  //    <Text style={styles.text}>Report Comment</Text>
                  //  </Pressable>
                  //</View>
                  null
                )}
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </Keyboard>
  );
};

export default SpecialistForum;