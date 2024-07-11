import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, TouchableHighlight, Image, Platform, StyleSheet } from 'react-native';
import { storage } from '../../firebaseConfig';
import { Feather, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import HTMLView from 'react-native-htmlview';
import ModalStyle from '../components/ModalStyle';

// Importing styles and components
import styles from '../components/styles';
import Keyboard from '../components/Keyboard';
import url from '../components/config.js';

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
  const [commentText, setCommentText] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [sortOrder, setSortOrder] = useState('newest');
  const [activeButton, setActiveButton] = useState('General');
  const [imageUrl, setImageUrls] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchForumPosts = async () => {
      try {
        const response = await axios.get(`${url}/getForumPosts`);
        if (response.data.status === "ok") {
          const posts = response.data.forumPosts;
          setForumPost(posts);
        } else {
          console.error("Error fetching forum posts:", response.data.error);
        }
      } catch (error) {
        console.error("Error fetching forum posts:", error);
      }
    };

    const fetchImage = async () => {
      try {
          const storageRef = storage.ref('adminAd');
          const images = await storageRef.listAll();

          // Get all image URLs or up to 5 if fewer
          const randomImages = [];
          const totalImages = Math.min(images.items.length, 5); // Limit to 5 or fewer images

          // Generate random indices without repetition
          const randomIndices = new Set();
          while (randomIndices.size < totalImages) {
              randomIndices.add(Math.floor(Math.random() * images.items.length));
          }

          for (let index of randomIndices) {
              const imageUrl = await images.items[index].getDownloadURL();
              randomImages.push(imageUrl);
          }

          setImageUrls(randomImages);
      } catch (error) {
          console.error('Error fetching images:', error);
      }
    };     

    fetchForumPosts();
    fetchImage();
  }, []);

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

  const sortedPosts = sortForumPosts(forumPost, sortOrder);

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

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleCategoryButtonClick = (category) => {
    setActiveButton(category);
  };

  const handleCommentTextChange = (postID, text) => {
    setCommentText((prevState) => ({
      ...prevState,
      [postID]: text,
    }));
  };

  return (
    <Keyboard>
      <ScrollView style={styles.container5}>
        <View style = {[styles.container4,  Platform.OS!=="web"&& {paddingTop:50}]}>
          <View style={[styles.container2, { paddingTop: 20, paddingHorizontal: 20 }]}>
            <Text style={styles.pageTitle}> Community Forum </Text>
          </View>

          <View style={[styles.adImageContainer, { width: '100%', alignItems: 'center' }]}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20}}
            >
              {imageUrl && imageUrl.map((url, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ width: 300, height: 200 }}>
                  {/* Image */}
                  <View style={{ ...StyleSheet.absoluteFillObject }}>
                    <Image
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'contain' }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
      </View>

      {/* Sort section */}
      <View style={[styles.container4, { marginBottom: 20, paddingHorizontal: 20 }]}>
        {/* Category Filter Buttons */}
        <View style={styles.buttonContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => handleCategoryButtonClick('General')}
              style={activeButton === 'General' ? styles.categoryBtnActive : styles.categoryBtn}
            >
              <Text style={styles.text}> General </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCategoryButtonClick('Ask Specialist')}
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
          {Platform.OS !== 'web' && 
            <View style={[styles.iconContainer, { marginLeft: 10 }]}>
            <AntDesign name="down" size={16} color="black" />
          </View>
          }
        </View>
      </View>

      {/* Posts + comments */}
      <View style={[styles.container3, { paddingHorizontal: 20 }]}>
        {sortedPosts.map((post, index) => {
          if (post.category === activeButton) {
            return (
              <View key={index} style={styles.forumPostContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.text3, { flex: 1, margin: 10 }]}>
                    {post.userInfo.firstName} {post.userInfo.lastName}
                  </Text>
                  <Text style={[styles.titleNote, {marginRight: 20}]}>{formatDate(post.dateCreated)}</Text>
                </View>

                <HTMLView style={{ margin: 10 }} stylesheet={{ div: styles.text }} value={post.description} />

                {/* Comments */}
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
                  <View key={commentIndex} style={[styles.container3, {marginLeft: 20, marginBottom: 20}]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <Text style={[styles.text3, {flex: 1, marginBottom: 10}]}>
                        {comment.userInfo.firstName} {comment.userInfo.lastName}
                      </Text>
                      <Text style={[styles.formText, {marginRight: 20}]}>{formatDate(comment.date)} </Text>
                    </View>
                    <Text style={[styles.text]}>{comment.userComment}</Text>
                  </View>
                ))}

                <View style={[styles.search, { paddingBottom: 10 }]}>
                  <TextInput
                    style={[styles.input4]}
                    value={commentText[post.postID] || ''}
                    onChangeText={(text) => handleCommentTextChange(post.postID, text)}
                    placeholder="Add a comment..."
                  />
                  <TouchableOpacity style={[styles.iconContainer, { right: 40 }]}>
                    <Feather name="upload" size={18} color="black" onPress={toggleModal} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          return null;
        })}
      </View>

      <ModalStyle isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
    </ScrollView>
  </Keyboard>
  );
};

export default Forum;