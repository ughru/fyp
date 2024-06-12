import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, TouchableHighlight, Modal, Pressable, Image, Platform } from 'react-native';
import { firebase } from '../../firebaseConfig';
import { Feather, Entypo, AntDesign, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';

// from js file
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import url from '../components/config.js';
import ModalStyle from '../components/ModalStyle';

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

const Forum = ({ navigation }) => {
  const [forumPost, setForumPost] = useState([]);
  const [forumPostsWithComments, setForumPostsWithComments] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [sortOrder, setSortOrder] = useState('newest');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [activeButton, setActiveButton] = useState('General');
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchForumPosts = async () => {
      try {
        const response = await axios.get(`${url}/getForumPosts`);
        if (response.data.status === "ok") {
          setForumPost(response.data.forumPosts);
        } else {
          console.error("Error fetching forum posts:", response.data.error);
        }
      } catch (error) {
        console.error("Error fetching forum posts:", error);
      }
    };

    const fetchImage = async () => {
      try {
        const url = await firebase.storage().ref('adminAd/ad.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchForumPosts();
    fetchImage();
  }, []);

  useEffect(() => {
    if (forumPost.length > 0) {
      countComments();
    }
  }, [forumPost]);

  const fetchComments = async (postID) => {
    try {
      const response = await axios.get(`${url}/getComments`, { params: { postID } });
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

  const countComments = () => {
    const postsWithComments = forumPost.map((post) => {
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

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSelection = (action) => {
    if (action === 'edit') {
      toggleModal();
    } else if (action === 'delete') {
      toggleModal();
    } else if (action === 'report') {
      toggleModal();
    }
    setDropdownVisible(false);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleCommentTextChange = (postID, text) => {
    setCommentText((prevState) => ({
      ...prevState,
      [postID]: text,
    }));
  };

  const handleGeneralButtonClick = () => {
    setActiveButton('General');
  };

  const handleAskSpecialistButtonClick = () => {
    setActiveButton('Ask Specialist');
  };

  return (
    <Keyboard>
      <ScrollView style={styles.container}>
        <View style={styles.container3}>
          <View style={[styles.container2, { marginTop: 50 }]}>
            <Text style={styles.pageTitle}> Community Forum </Text>
            <TouchableOpacity style={styles.iconContainer} onPress={toggleModal}>
              <Feather name="edit" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.adImageContainer}>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.adImage} />}
          </View>
        </View>

        {/* Sort section */}
        <View style={[styles.container3, { marginBottom: 20 }]}>
          {/* Category Filter Buttons */}
          <View style={styles.buttonContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={handleGeneralButtonClick}
                style={activeButton === 'General' ? styles.categoryBtnActive : styles.categoryBtn}
              >
                <Text style={styles.text}> General </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAskSpecialistButtonClick}
                style={activeButton === 'Ask Specialist' ? styles.categoryBtnActive : styles.categoryBtn}
              >
                <Text style={styles.text}> Ask Specialist </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.text, { marginRight: 10 }]}>Sort by:</Text>
            <RNPickerSelect
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value)}
              items={[
                { label: 'Newest', value: 'newest' },
                { label: 'Oldest', value: 'oldest' },
              ]}
            />
            <View style={[styles.iconContainer, { marginLeft: 10 }]}>
              <AntDesign name="down" size={16} color="black" />
            </View>
          </View>
        </View>

        {/* Posts + comments */}
        <View style={styles.container3}>
          {sortedPosts.map((post, index) => (
            <View key={index} style={styles.forumPostContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.text, { flex: 1, margin: 10 }]}> User: {post.user}</Text>
                <Text style={styles.titleNote}>{formatDate(post.date)}</Text>
                <TouchableHighlight
                  style={[styles.threeDotVert, { padding: 15 }]}
                  onPress={toggleDropdown}
                  underlayColor={Platform.OS === 'web' ? 'transparent' : '#e0e0e0'}
                >
                  <Entypo name="dots-three-vertical" size={10} />
                </TouchableHighlight>
              </View>

              <Modal
                transparent={true}
                animationType="slide"
                visible={isDropdownVisible}
                onRequestClose={() => setDropdownVisible(false)}
              >
                <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
                  <View style={{
                    width: '90%',
                    backgroundColor: '#E3C2D7',
                    borderRadius: 10,
                    padding: 20,
                  }}>
                    <Pressable style={{ marginLeft: 'auto' }}>
                      <Feather name="x" size={24} color="black" onPress={handleSelection} />
                    </Pressable>
                    {/* Selections */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                      <Feather name="edit" size={22} color="black" />
                      <Pressable style={{ marginLeft: 10 }} onPress={() => handleSelection('edit')}>
                        <Text style={styles.text}> Edit Post </Text>
                      </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                      <MaterialIcons name="delete-outline" size={24} color="black" />
                      <Pressable style={{ marginLeft: 10 }} onPress={() => handleSelection('delete')}>
                        <Text style={styles.text}> Delete Post </Text>
                      </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                      <MaterialIcons name="report" size={24} color="black" />
                      <Pressable style={{ marginLeft: 10 }} onPress={() => handleSelection('report')}>
                        <Text style={styles.text}> Report Post </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>

              <Text style={[styles.text, { margin: 10 }]}> {post.description}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                  <Text style={styles.formText}>view {post.commentCount} replies</Text>
                </TouchableHighlight>
              </View>

              {visibleComments[post.postID] && (
                <View style={styles.commentsContainer}>
                  {visibleComments[post.postID].map((comment, index) => (
                    <View key={index} style={styles.commentItem}>
                      <Text style={styles.text}>User: {comment.user}</Text>
                      <Text style={styles.text}>{comment.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={[styles.search]}>
                <TextInput
                  style={[styles.input4]}
                  value={commentText[post.postID] || ''}
                  onChangeText={(text) => handleCommentTextChange(post.postID, text)}
                  placeholder="Add a comment..."
                />
                <TouchableOpacity style={[styles.iconContainer, { right: 40 }]} onPress={toggleModal}>
                  <Feather name="upload" size={18} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <ModalStyle isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
      </ScrollView>
    </Keyboard>
  );
};

export default Forum;