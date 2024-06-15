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

export const fetchResources = async () => {
  const currentDate = formatDate(new Date());

  try {
    const storedDate = await AsyncStorage.getItem('resourceDate');
    const storedResources = await AsyncStorage.getItem('resources');

    if (storedDate === currentDate && storedResources) {
      // Use stored resources
      return JSON.parse(storedResources);
    } else {
      // Clear outdated data
      await AsyncStorage.removeItem('resourceDate');
      await AsyncStorage.removeItem('resources');

      // Fetch new resources and store them
      const response = await axios.get(`${url}/resourceReco`);

      // If no resource exist
      if (response.data.length === 0) {
        // Clear storage as the database is empty
        await AsyncStorage.removeItem('resourceDate');
        await AsyncStorage.removeItem('resources');
        return [];
      }
      
      const randomResources = getRandomSample(response.data, 10);

      // Store resources and date
      await AsyncStorage.setItem('resourceDate', currentDate);
      await AsyncStorage.setItem('resources', JSON.stringify(randomResources));

      return randomResources;
    }
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
};