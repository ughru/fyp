import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, TouchableHighlight, Image, Platform, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
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

const { width: screenWidth } = Dimensions.get('window');

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
  const [inputHeight, setInputHeight] = useState({});
  const [adminAds, setAdminAds] = useState([]);
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForumPosts = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false); 
      }
    };

    const fetchImage = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}/getAdminEventAds`);
        if (response.data.status === 'ok') {
          const images = response.data.adminAds.map(ad => ad.imageUrl);
          setImageUrls(images);
          setAdminAds(response.data.adminAds);
        } else {
          console.error('Error fetching images:', response.data.error);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false); 
      }
    };

    fetchForumPosts();
    fetchImage();
  }, []);

  const fetchComments = async (postID) => {
    setLoading(true);
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
    } finally {
      setLoading(false); 
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

  const handleInputHeightChange = (postID, height) => {
    setInputHeight((prevState) => ({
      ...prevState,
      [postID]: height,
    }));
  };

  return (
    <Keyboard>
      <ScrollView style={styles.container5}>
        <View style = {[styles.container4,  Platform.OS!=="web"&& {paddingTop:50}]}>
          <View style={[styles.container2, { paddingTop: 20, paddingHorizontal: 20 }]}>
            <Text style={styles.pageTitle}> Community Forum </Text>
            <TouchableOpacity style={styles.iconContainer} onPress={toggleModal}>
              <Feather name="edit" size={24} color="black" />
            </TouchableOpacity>
          </View> 

          <View style={[styles.adImageContainer, {
            ...Platform.select({
            web:{width:screenWidth*0.9, paddingTop:20, left: 20, paddingRight:10},
            default:{paddingTop:20, left: 20, paddingRight:10}
          }) }]}>
          {adminAds.length > 0 && (
            <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20}}>
              {adminAds.map((ad, index) => (
                <View key={index} style= {{marginBottom: 20}}>
                <TouchableOpacity style={{ width: 300, height: 200 }}>
                  {/* Image */}
                  <View style={{ ...StyleSheet.absoluteFillObject }}>
                    <Image source={{ uri: ad.imageUrl  }}
                      style={{ width: '100%', height: '100%', borderRadius: 10, resizeMode: 'contain' }}/>
                  </View>
                </TouchableOpacity>
                <Text style= {[styles.text, {alignSelf: 'center'}]}> {ad.title}</Text>
                </View>
              ))}
            </ScrollView>
          )}
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
      <View style={[styles.container3, { paddingHorizontal: 20 }]}>
      {loading ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Text>Loading posts...</Text>
          <ActivityIndicator size="large" color="#E3C2D7" />
        </View>
        ) : (
        sortedPosts.map((post, index) => {
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
                      <Text style={[styles.formText, {marginBottom:8, marginRight: 20}]}>{formatDate(comment.date)} </Text>
                    </View>
                    <Text style={[styles.text]}>{comment.userComment}</Text>
                  </View>
                ))}

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
                  <TouchableOpacity style={[styles.iconContainer, { marginLeft: 10, paddingBottom: 10 }]}>
                    <Feather name="upload" size={22} color="black" onPress={toggleModal} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          return null;
        }))}
      </View>

      <ModalStyle isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
    </ScrollView>
  </Keyboard>
  );
};

export default Forum;