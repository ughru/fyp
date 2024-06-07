import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import styles from '../components/styles';
import { fetchResources } from '../components/manageResource';
import ModalStyle from '../components/ModalStyle';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};  

const getWeek = () => {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentDay = today.getDate();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + i);
    weekDates.push(date.getDate());
  }

  return { weekDays, weekDates, currentDay };
};

const PreHome = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(null);
  const { weekDays, weekDates, currentDay } = getWeek();
  const [resources, setResources] = useState([]);
  const scrollRef = useRef();
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const date = new Date();
    const formattedDate = formatDate(date);

    const fetchAndSetResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    };

    fetchAndSetResources();
    setCurrentDate(formattedDate);
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style = {[styles.container3, {top: 50}]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={styles.date}>{currentDate}</Text>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
        <Text style={[styles.textTitle, {marginTop: 20}]}>Welcome to Bloom!</Text>
      </View>

      <View style = {[styles.container3, {marginTop: 60}]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable style={styles.button7} />
          <Text style={[styles.text, { marginLeft: 10 }]}>Today</Text>
          <Pressable style={[styles.button8, { marginLeft: 30 }]} />
          <Text style={[styles.text, { marginLeft: 10 }]}>Ovulation</Text>
        </View>

        <View style={[styles.calendarContainer]}>
          <View style={styles.header}>
            {weekDays.map((day, index) => (
              <Text key={index} style={styles.dayLabel}>{day}</Text>
            ))}
          </View>
          <View style={styles.days}>
            {weekDates.map((date, index) => (
              <Text key={index} style={[styles.date2, date === currentDay && styles.currentDate]}>{date}</Text>
            ))}
          </View>
        </View>

        <Pressable style={[styles.button, { alignSelf: 'center', marginTop: 20, marginBottom: 20 }]} onPress={toggleModal}>
          <Text style={styles.text}>Log Period</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <MaterialIcons name="history" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={toggleModal}>
            <Text style={styles.questionText}>Cycle History</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="scale-outline" size={24} color="black" />
          <Pressable style={{ marginLeft: 10 }} onPress={toggleModal}>
            <Text style={styles.questionText}>Weight Tracker</Text>
          </Pressable>
        </View>

        <Text style={[styles.titleNote, { marginBottom: 20 }]}>Suggested for you</Text>
      </View>

      <View>
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingVertical: 10, marginBottom: 20 }}>
          {resources.map(
            (resource, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceBtn}
                onPress={toggleModal}
              >
                <Text>{resource.title}</Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      <Pressable style={[styles.button, { alignSelf: 'center' }]} onPress={() => navigation.navigate("Resources")}>
        <Text style={styles.text}>See more</Text>
      </Pressable>

      <ModalStyle  isVisible={isModalVisible} onClose={toggleModal} navigation={navigation} />
    </ScrollView>
  );
};

export default PreHome;
