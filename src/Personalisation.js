import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect} from '@react-navigation/native';
import { View, Text, Pressable, ScrollView, Platform, TouchableOpacity, Dimensions , TextInput, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './components/styles';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import url from './components/config';
import { storage } from '../firebaseConfig'; 

const { width: screenWidth } = Dimensions.get('window');

const AdditionalView = ({ navigation, selections }) => {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const { q1, q3 = 'Pre', q5, q6, q7, q8, q9, q10 } = selections;
    const messages = [];
    
    // Check q1 for age range and q3 for status
    if (q1 === '35 and above') {
      messages.push('Consider seeing a doctor for personalized advice.\n\n');

      if (q3 === 'Pre' && (q5 === '6 months to a year' || q5 === 'More than a year')) {
        messages.push('See a doctor to discuss your options.\n\n');
      }
    }

    // Check if q3 is 'Pre'
    if (q3 === 'Pre') {
      if (q6) {
        messages.push('Track your cycle with our LogPeriod & CycleHistory feature.\n');
      }

      if (q7 === "I’ve heard about it, but I don’t do it" || q7 === "I don't know what the fertile window is") {
        messages.push('Understand the importance of the fertile window to increase chances of pregnancy using our LogPeriod & CycleHistory feature.\n\n');
      }

      if (q8) {
        messages.push('Book an appointment to improve chances of a healthy pregnancy.\n\n');
      }

      if (q9) {
        messages.push('Refer to our Resource Hub for more information.\n\n');
      }

      if (q10 && q10 !== "None of the above") {
        messages.push('Consult a doctor and understand pregnancy complications.\n');
      }
    }

    // Check if q3 is 'During'
    if (q3 === 'During') {
      if ((q6 && q6 !== "None of the above") || q7 === "Unsure") {
        messages.push('Refer to our Resource Hub for more information.\n\n');
      }

      if (q8 === "None") {
        messages.push('Consider necessary care for a healthy pregnancy. Get insights from others mums using our Community Forum.\n\n');
      }

      if (q9 === "Unsure") {
        messages.push('Consult specialist through our Community Forum\n\n');
      }

      if (q10 && q10!== "None of the above") {
        messages.push('Consult a doctor and understand pregnancy complications.\n');
      }
    }

    // Check if q3 is 'Post'
    if (q3 === 'Post') {
      if (q5 || q7) {
        messages.push('Refer to our Resource Hub Baby Needs category for more information.\n\n');
      }

      if (q8 && q8 !== "None of the above") {
        messages.push('Consult specialist/gain insights from other mums through our Community Forum. Refer to Resource Hub for more information\n\n');
      }
    }

    const fetchImage = async () => {
      try {
        const url = await storage.ref('miscellaneous/error.png').getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
    setMessage(messages.join(' '));
  }, [selections]);

  const saveSelections = async () => {
    try {
      await AsyncStorage.setItem('userSelections', JSON.stringify(selections));
    } catch (error) {
      console.error('Error saving selections:', error);
    }
  };

  const handleNextPress = async () => {
    await saveSelections();
    navigation.navigate('HomePage');
  };

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 50 }}>
      {message ? (
        <Text style={[styles.text, { marginBottom: 20 }]}>{message}</Text>
      ) : (
        <>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 200, height: 200, marginBottom: 10 }}
            />
          )}
          <Text style={[styles.text, { marginBottom: 20 }]}>No Personalized Recommendations</Text>
        </>
      )}
      <Pressable style={styles.button} onPress={handleNextPress}>
        <Text>Next</Text>
      </Pressable>
    </View>
  );
};

const Personalisation = ({navigation}) => {
  // others
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [categories, setCategories] = useState([]);
  const itemRef = useRef([]);
  const [dateError, setError] = useState('');
  const [showAdditionalView, setShowAdditionalView] = useState(false);

  // selection
  const [selectedStatus, setSelectedStatus] = useState('Pre');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selections, setSelections] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [conceptionDate, setConceptionDate] = useState('');

  let filteredCategories = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [categoriesResponse] = await Promise.all([
        axios.get(`${url}/categories`),
      ]);

      filteredCategories = categoriesResponse.data.filter(category =>
        category.categoryName !== "All" && category.categoryName !== "Pregnancy Summary" && category.categoryName !== "Uncategorized"
      );

      setCategories(filteredCategories);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const fetchUserSelections = useCallback(async () => {
    try {
      const storedSelections = await AsyncStorage.getItem('userSelections');
      if (storedSelections !== null) {
        setSelections(JSON.parse(storedSelections));
        const parsedSelections = JSON.parse(storedSelections);
        setSelectedStatus(parsedSelections.q3 || 'Pre');
        setSelectedCategories(parsedSelections.q4 || []);
        setConceptionDate(parsedSelections.q5 || '');
      }
    } catch (error) {
      console.error('Error fetching userSelections from AsyncStorage:', error);
    }
  }, []);

  useEffect(() => { 
    fetchUserSelections();
    fetchData(); 
  }, [fetchUserSelections, fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserSelections();
      fetchData();
      setCurrentQuestion(0);
    }, [fetchUserSelections, fetchData])
  );

  const initialQuestion = [
    {
      key: 'q1', title: 'Q1',
      content: (
        <View style={styles.container3}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>What is your age range?</Text>
          <Pressable style={[styles.button2, selectedOption === '18 - 24' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q1', '18 - 24')}>
            <Text style={styles.text}> 18 - 24 </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === '25 - 34' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q1', '25 - 34')}>
            <Text style={styles.text}> 25 - 34 </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === '35 - 44' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q1', '35 - 44')}>
            <Text style={styles.text}> 35 and above </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Prefer not to say' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q1', 'Prefer not to say')}>
            <Text style={styles.text}> Prefer not to say </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q2', title: 'Q2',
      content: (
        <View style={styles.container3}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>What is your BMI range?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Underweight (BMI < 18.5)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q2', 'Underweight (BMI < 18.5)')}>
            <Text style={styles.text}> Underweight (BMI {"<"} 18.5) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Normal weight (BMI 18.5-24.9)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q2', 'Normal weight (BMI 18.5-24.9)')}>
            <Text style={styles.text}> Normal weight (BMI 18.5-24.9) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Overweight (BMI 25-29.9)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q2', 'Overweight (BMI 25-29.9)')}>
            <Text style={styles.text}> Overweight (BMI 25-29.9) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Obese (BMI 30 or higher)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q2', 'Obese (BMI 30 or higher)')}>
            <Text style={styles.text}> Obese (BMI 30 or higher) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I don’t know my BMI' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q2', 'I don’t know my BMI')}>
            <Text style={styles.text}> I don’t know my BMI </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Prefer not to say' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q2', 'Prefer not to say')}>
            <Text style={styles.text}> Prefer not to say </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q3', title: 'Q3',
      content: (
        <View style={styles.container3}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>Which phase are you currently in?</Text>
          <Pressable style={[styles.button2, selectedStatus === 'Pre' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleStatusSelection('Pre')}>
            <Text style={[styles.text]}>Pre Pregnancy</Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedStatus === 'During' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleStatusSelection('During')}>
            <Text style={[styles.text]}>During Pregnancy</Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedStatus === 'Post' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleStatusSelection('Post')}>
            <Text style={[styles.text]}>Post Pregnancy</Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q4', title: 'Q4',
      content: (
        <View style={[{ marginLeft: 20 }, Platform.OS === "web" ? { width: screenWidth * 0.9 } : { width: '100%' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>What topics are you most interested in?</Text>
          <ScrollView style={styles.container3}
            contentContainerStyle={Platform.OS === "web" ? styles.resourceContainerWeb : styles.resourceContainerMobile}>

            {categories.map((category, index) => (
              (selectedStatus !== "During" && category.categoryName === "Pregnancy Summary") ? null :
                <View key={index} style={{ marginBottom: 15 }}>
                  <TouchableOpacity key={index} ref={(el) => (itemRef.current[index] = el)}
                    style={[selectedCategories.includes(category.categoryName) ? styles.categoryBtnActive : styles.categoryBtn,
                    { marginRight: 10 }]}
                    onPress={() => handleCategorySelection(category.categoryName)}>
                    <Text style={styles.text}> {category.categoryName}  </Text>
                  </TouchableOpacity>
                </View>
            ))}
          </ScrollView>
        </View>
      ),
    },
  ];

  const preQn = [
    {
      key: 'q5', title: 'Q5',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>How long have you been actively trying to conceive?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Just getting started' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', 'Just getting started')}>
            <Text style={styles.text}> Just getting started </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === '1-3 months' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', '1-3 months')}>
            <Text style={styles.text}> 1-3 months </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === '3-6 months' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', '3-6 months')}>
            <Text style={styles.text}> 3-6 months </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === '6 months to a year' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', '6 months to a year')}>
            <Text style={styles.text}> 6 months to a year </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'More than a year' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', 'More than a year')}>
            <Text style={styles.text}> More than a year </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q6', title: 'Q6',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>
            Would you describe your periods as regular (less than 7 days difference between shortest and longest cycle)?
          </Text>
          <Pressable style={[styles.button2, selectedOption === 'Yes' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'Yes')}>
            <Text style={styles.text}> Yes </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'No' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'No')}>
            <Text style={styles.text}> No </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I don’t know' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'I don’t know')}>
            <Text style={styles.text}> I don't know </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q7', title: 'Q7',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>
            Do you calculate your fertile window when planning sex life?
          </Text>
          <Pressable style={[styles.button2, selectedOption === 'Yes' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'Yes')}>
            <Text style={styles.text}> Yes </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I’ve heard about it, but I don’t do it' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'I’ve heard about it, but I don’t do it')}>
            <Text style={styles.text}> I’ve heard about it, but I don’t do it </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I don’t know what the fertile window is' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'I don’t know what the fertile window is')}>
            <Text style={styles.text}> I don’t know what the fertile window is </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q8', title: 'Q8',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>
            Have you sought pre-pregnancy care recently?
          </Text>
          <Pressable style={[styles.button2, selectedOption === 'I’ve been to a check-up' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'I’ve been to a check-up')}>
            <Text style={styles.text}> I’ve been to a check-up </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I’ve undergone treatment' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'I’ve undergone treatment')}>
            <Text style={styles.text}> I've undergone treatment </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I’m waiting for an appointment' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'I’m waiting for an appointment')}>
            <Text style={styles.text}> I’m waiting for an appointment </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I don’t think it is necessary' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'I don’t think it is necessary')}>
            <Text style={styles.text}> I don’t think it is necessary </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q9', title: 'Q9',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>Do you take any prenatal vitamins or supplements?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Yes, a special vitamin complex' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q9', 'Yes, a special vitamin complex')}>
            <Text style={styles.text}> Yes, a special vitamin complex </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I take folic acid' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q9', 'I take folic acid')}>
            <Text style={styles.text}> I take folic acid </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I don’t take any vitamins or supplements' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q9', 'I don’t take any vitamins or supplements')}>
            <Text style={styles.text}> I don’t take any vitamins or supplements </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q10', title: 'Q10',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>Have you ever experienced any of the following conditions?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Yeast infections' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q10', 'Yeast infections')}>
            <Text style={styles.text}> Yeast infections </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Urinary tract infections (UTIs)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q10', 'Urinary tract infections (UTIs)')}>
            <Text style={styles.text}> Urinary tract infections (UTIs) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Bacterial Vaginosis (BV)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q10', 'Bacterial Vaginosis (BV)')}>
            <Text style={styles.text}> Bacterial Vaginosis (BV) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Polycystic ovary syndrome (PCOS)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q10', 'Polycystic ovary syndrome (PCOS)')}>
            <Text style={styles.text}> Polycystic ovary syndrome (PCOS) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Endometriosis' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q10', 'Endometriosis')}>
            <Text style={styles.text}> Endometriosis </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Fibroids' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q10', 'Fibroids')}>
            <Text style={styles.text}> Fibroids </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'I’m not sure' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q10', 'I’m not sure')}>
            <Text style={styles.text}> I’m not sure </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'None of the above' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q10', 'None of the above')}>
            <Text style={styles.text}> None of the above </Text>
          </Pressable>
        </View>
      ),
    },
  ];  

  const duringQn = [
    {
      key: 'q5', title: 'Q5',
      content: (
        <View style={styles.container3}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>When is your conception date?</Text>
          <TextInput
            style={[styles.input]}
            placeholder="Enter date (dd/mm/yyyy)"
            value={conceptionDate}
            onChangeText={(text) => handleDateChange(text)}
            keyboardType="numeric"
          />
          {dateError ? <Text style={styles.error}>{dateError}</Text> : null}
        </View>
      ),
    },
    {
      key: 'q6', title: 'Q6',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>Do you have any pregnancy-related conditions?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Gestational diabetes' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'Gestational diabetes')}>
            <Text style={styles.text}> Gestational diabetes </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Hypertension' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'Hypertension')}>
            <Text style={styles.text}> Hypertension </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Pre-eclampsia' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'Pre-eclampsia')}>
            <Text style={styles.text}> Pre-eclampsia </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Hyperemesis gravidarum' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'Hyperemesis gravidarum')}>
            <Text style={styles.text}> Hyperemesis gravidarum </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'None of the above' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'None of the above')}>
            <Text style={styles.text}> None of the above </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q7', title: 'Q7',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>What is your preferred method of delivery?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Vaginal delivery' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'Vaginal delivery')}>
            <Text style={styles.text}> Vaginal delivery </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Cesarean section' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'Cesarean section')}>
            <Text style={styles.text}> Cesarean section </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Unsure' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'Unsure')}>
            <Text style={styles.text}> Unsure </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q8', title: 'Q8',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>What kind of prenatal care are you receiving?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Regular check-ups with an obstetrician' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'Regular check-ups with an obstetrician')}>
            <Text style={styles.text}> Regular check-ups with an obstetrician </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Midwife care' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'Midwife care')}>
            <Text style={styles.text}> Midwife care </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Combined obstetrician and midwife care' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'Combined obstetrician and midwife care')}>
            <Text style={styles.text}> Combined obstetrician and midwife care </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Alternative care (e.g., doula, holistic practices)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'Alternative care (e.g., doula, holistic practices)')}>
            <Text style={styles.text}> Alternative care (e.g., doula, holistic practices) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'None' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'None')}>
            <Text style={styles.text}> None </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q9', title: 'Q9',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>What is your preferred method of pain management during labor?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Natural (no medication)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q9', 'Natural (no medication)')}>
            <Text style={styles.text}> Natural (no medication) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Epidural' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q9', 'Epidural')}>
            <Text style={styles.text}> Epidural </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Other pain medications' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q9', 'Other pain medications')}>
            <Text style={styles.text}> Other pain medications </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Unsure' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q9', 'Unsure')}>
            <Text style={styles.text}> Unsure </Text>
          </Pressable>
        </View>
      ),
    },
  ];  

  const postQn = [
    {
      key: 'q5', title: 'Q5',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>How long ago did you give birth?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Less than a month' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', 'Less than a month')}>
            <Text style={styles.text}> Less than a month </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === '1-3 months' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', '1-3 months')}>
            <Text style={styles.text}> 1-3 months </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === '3-6 months' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', '3-6 months')}>
            <Text style={styles.text}> 3-6 months </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === '6 months to a year' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', '6 months to a year')}>
            <Text style={styles.text}> 6 months to a year </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'More than a year' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q5', 'More than a year')}>
            <Text style={styles.text}> More than a year </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q6', title: 'Q6',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>What type of delivery did you have?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Vaginal delivery' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'Vaginal delivery')}>
            <Text style={styles.text}> Vaginal delivery </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Cesarean section' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'Cesarean section')}>
            <Text style={styles.text}> Cesarean section </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Assisted delivery (forceps/vacuum)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q6', 'Assisted delivery (forceps/vacuum)')}>
            <Text style={styles.text}> Assisted delivery (forceps/vacuum) </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q7', title: 'Q7',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>Are you currently breastfeeding?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Yes, exclusively' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'Yes, exclusively')}>
            <Text style={styles.text}> Yes, exclusively </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Yes, partially (supplementing with formula)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'Yes, partially (supplementing with formula)')}>
            <Text style={styles.text}> Yes, partially (supplementing with formula) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'No' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q7', 'No')}>
            <Text style={styles.text}> No </Text>
          </Pressable>
        </View>
      ),
    },
    {
      key: 'q8', title: 'Q8',
      content: (
        <View style={[styles.container3, { alignItems: 'center' }]}>
          <Text style={[styles.questionText, { alignSelf: 'center', marginBottom: 20 }]}>Do you have any postpartum health concerns?</Text>
          <Pressable style={[styles.button2, selectedOption === 'Postpartum depression or anxiety' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'Postpartum depression or anxiety')}>
            <Text style={styles.text}> Postpartum depression or anxiety </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Physical recovery (e.g., perineal pain, C-section recovery)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'Physical recovery (e.g., perineal pain, C-section recovery)')}>
            <Text style={styles.text}> Physical recovery (e.g., perineal pain, C-section recovery) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Breastfeeding issues (e.g., latch problems, low milk supply)' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'Breastfeeding issues (e.g., latch problems, low milk supply)')}>
            <Text style={styles.text}> Breastfeeding issues (e.g., latch problems, low milk supply) </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'Sleep deprivation' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'Sleep deprivation')}>
            <Text style={styles.text}> Sleep deprivation </Text>
          </Pressable>
          <Pressable style={[styles.button2, selectedOption === 'None of the above' && { backgroundColor: '#E3C2D7' }]} onPress={() => handleOptionSelection('q8', 'None of the above')}>
            <Text style={styles.text}> None of the above </Text>
          </Pressable>
        </View>
      ),
    },
  ];  

  const handleStatusSelection = async (status) => {
    // Determine the status to store, defaulting to "Pre" if empty
    let statusToStore = status !== '' ? status : 'Pre';

    // Update selectedStatus state
    setSelectedStatus(statusToStore);

    // Store user selection locally
    try {
        await AsyncStorage.setItem('selectedStatus', statusToStore);
    } catch (error) {
        console.error('Error storing selected status in AsyncStorage:', error);
    }

    setSelections(prevSelections => ({
      ...prevSelections,
      q3: statusToStore
    }));

    // Navigate to the next question or home page
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowAdditionalView(true);
      {/*navigation.navigate("HomePage");*/}
    }
  };
  
  const handleCategorySelection = (categoryName) => {
    const updatedCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(item => item !== categoryName)
      : [...selectedCategories, categoryName];
    setSelectedCategories(updatedCategories);

    setSelections(prevSelections => ({
      ...prevSelections,
      q4: updatedCategories
    }));

  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigation.goBack(); 
    }
  };

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      saveSelections();
      handleStatusSelection(selectedStatus);
      setShowAdditionalView(true);
      {/*navigation.navigate("HomePage");*/}
    }
  };  

  const handleOptionSelection = (questionKey, option) => {
    setSelections(prevSelections => ({
      ...prevSelections,
      [questionKey]: option || "-"
    }));

    setTimeout(() => {
      // Determine current set of questions based on selectedStatus
      const currentQuestions = getQuestions();
      const index = currentQuestions.findIndex(q => q.key === questionKey);

      // Update selectedOption and currentQuestion based on the length of currentQuestions
      if (index < currentQuestions.length - 1) {
        setSelectedOption(null); // Reset selectedOption
        setCurrentQuestion(index + 1); // Move to the next question
      } else {
        navigation.navigate("HomePage");
      }
    }, 200);
  };

  const handleDateChange = (date) => {
    setConceptionDate(date);

    // Update selections with Q5 and conception date
    setSelections(prevSelections => ({
      ...prevSelections,
      q5: date === '' ? '' : date
    }));
  };

  const getQuestions = () => {
    let additionalQuestions = [];
    switch (selectedStatus) {
      case 'Pre':
        additionalQuestions = preQn;
        break;
      case 'During':
        additionalQuestions = duringQn;
        break;
      case 'Post':
        additionalQuestions = postQn;
        break;
      default:
        additionalQuestions = [];
    }
    return [...initialQuestion, ...additionalQuestions, 
      { content: <AdditionalView navigation={navigation} selections={selections} /> },
    ];
  };

  const questions = getQuestions();
  let skipButtonText = "Skip";

  if (currentQuestion === 3) {
    skipButtonText = selectedCategories.length > 0 ? "Next" : "Skip";
  } else if (currentQuestion === 4) {
    skipButtonText = conceptionDate !== '' ? "Next" : "Skip";
  }

  const ProgressBar = ({ question, questions }) => {
    const progress = question / questions;

    return (
      <View style={[styles.progressBarContainer, { marginLeft: 10 }]}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    );
  };

  const saveSelections = async () => {
    try {
      // Save selections to AsyncStorage
      await AsyncStorage.setItem('userSelections', JSON.stringify(selections));
    } catch (error) {
      console.error('Error saving selections:', error);
    }
  };
  
  return (
    <ScrollView contentContainerStyle={[styles.container]}>
      {/* Back Button */}
      <View style={[styles.container4, Platform.OS !== "web" && { paddingTop: 50 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 20 }}>
          <AntDesign name="left" size={24} color="black" />
          <Pressable style={[styles.formText]} onPress={handleBack}>
            <Text style={styles.text}> back </Text>
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
          <ProgressBar question={currentQuestion + 1} questions={questions.length} />
          <Pressable style={{ marginLeft: 20 }} onPress={handleSkip}>
            <Text style={[styles.formText, { fontSize: 18 }]}>{skipButtonText}</Text>
          </Pressable>
        </View>

        {/* Personalisation Questions */} 
        <View style={[styles.container3, { paddingTop: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 50 }]}>
        {questions[currentQuestion]?.content}
        </View>
      </View>
    </ScrollView>
  );
};

export default Personalisation;