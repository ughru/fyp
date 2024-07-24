import React from 'react';
import { View, Text} from 'react-native';
import styles from './styles';

const getWeek = (selectedDate) => {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const dateToUse = selectedDate ? new Date(selectedDate) : today;
  const currentDay = dateToUse.getDate();
  const firstDayOfWeek = new Date(dateToUse);
  firstDayOfWeek.setDate(dateToUse.getDate() - dateToUse.getDay());

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + i);
    weekDates.push(date.getDate());
  }

  return { weekDays, weekDates, currentDay };
};

const Calendar = ({ selectedDate }) => {
  const { weekDays, weekDates, currentDay } = getWeek(selectedDate);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.header}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.dayLabel}>{day}</Text>
        ))}
      </View>
      <View style={styles.days}>
        {weekDates.map((date, index) => (
          <Text
            key={index}
            style={[
              styles.date2,
              date === currentDay && styles.currentDate,
              date === (selectedDate ? new Date(selectedDate).getDate() : currentDay) && styles.selectedDate,
            ]}
          >
            {date}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default Calendar;
