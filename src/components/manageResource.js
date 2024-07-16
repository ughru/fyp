import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import url from './config';

const formatDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-GB', options);
};

const getRandomSample = (array, sampleSize) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
};

const fetchUserSelections = async () => {
  try {
    const selections = await AsyncStorage.getItem('userSelections');
    return selections ? JSON.parse(selections) : null;
  } catch (error) {
    console.error('Error fetching user selections:', error);
    return null;
  }
};

export const fetchResources = async () => {
  const currentDate = formatDate(new Date());

  try {
    // Fetch all resources
    const response = await axios.get(`${url}/resource`);
    let resources = response.data.resources;

    // Fetch user selections
    const userSelections = await fetchUserSelections();

    // Filter resources based on user selections if q4 exists
    if (userSelections && userSelections.q4) {
      const selectedCategories = userSelections.q4;
      resources = resources.filter(resource => selectedCategories.includes(resource.category));
    }

    // Determine final resources to display
    let finalResources = [];

    if (userSelections && userSelections.q4) {
      // Display all filtered resources if <= 10
      finalResources = resources;
    } else {
      // Otherwise, get a random sample of 10 resources from all resources
      finalResources = getRandomSample(resources, 10);
    }

    // Store resources and date
    await AsyncStorage.setItem('resourceDate', currentDate);
    await AsyncStorage.setItem('resources', JSON.stringify(finalResources));

    return finalResources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
};