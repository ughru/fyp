import React from 'react';
import { View, Text} from 'react-native';
import styles from './styles';

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

const Calendar = () => {
  const { weekDays, weekDates, currentDay } = getWeek();

  return (
    <View style={styles.container}>
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
  );
};

export default Calendar;
