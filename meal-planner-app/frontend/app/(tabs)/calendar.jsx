import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WeekDay = ({ date, day, isSelected, onPress }) => (
  <Pressable
    style={[styles.weekDay, isSelected && styles.selectedWeekDay]}
    onPress={onPress}
  >
    <Text style={[styles.weekDayText, isSelected && styles.selectedWeekDayText]}>{day}</Text>
    <Text style={[styles.dateText, isSelected && styles.selectedWeekDayText]}>{date}</Text>
  </Pressable>
);

const MealItem = ({ title, duration, type }) => (
  <View style={styles.mealItem}>
    <View style={styles.mealContent}>
      <Text style={styles.mealTitle}>{title}</Text>
      <Text style={styles.mealInfo}>{duration} • {type}</Text>
    </View>
  </View>
);

const DaySection = ({ date, meals, onAddMeal }) => {
  return (
    <View style={styles.daySection}>
      <View style={styles.daySectionHeader}>
        <Text style={styles.daySectionTitle}>{date}</Text>
        <Pressable onPress={onAddMeal}>
          <Text style={styles.plusButton}>+</Text>
        </Pressable>
      </View>
      <View>
        {meals.length > 0 ? (
          meals.map((meal, index) => (
            <MealItem key={index} {...meal} />
          ))
        ) : (
          <Text style={styles.noMealsText}>You have not selected any meals yet.</Text>
        )}
      </View>
    </View>
  );
};

const CalendarPage = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollViewRef = React.useRef();

  // For the top calendar - only shows TODAY
  const getCalendarDayLabel = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date.toDateString() === today.toDateString()) return 'TODAY';
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
  };

  // For the meal sections - shows YESTERDAY, TODAY, TOMORROW
  const getSectionDayLabel = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
    if (date.toDateString() === today.toDateString()) return 'TODAY';
    if (date.toDateString() === tomorrow.toDateString()) return 'TOMORROW';
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
  };

  const generateWeekDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDay();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - currentDay + i);
      days.push({
        day: getCalendarDayLabel(date),
        date: date.getDate(),
        fullDate: date,
      });
    }
    return days;
  };

  const weekDays = generateWeekDays();

  const formatSectionDate = (date) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dayLabel = getSectionDayLabel(date);
    return `${dayLabel} - ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const generateMealsObject = () => {
    const mealsObj = {};
    weekDays.forEach(({ fullDate }) => {
      const dateKey = formatSectionDate(fullDate);
      mealsObj[dateKey] = [];
    });
    return mealsObj;
  };

  const meals = generateMealsObject();

  useEffect(() => {
    // Set initial scroll position to todays card
    const todayIndex = weekDays.findIndex(day =>
      day.fullDate.toDateString() === new Date().toDateString()
    );
    if (todayIndex !== -1 && scrollViewRef.current) {
      // Add delay for the scroll to happen after render to stop any bugs
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          y: todayIndex * 150,
          animated: true
        });
      }, 100);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>

      <View style={styles.calendarContainer}>
        <View style={styles.weekView}>
          {weekDays.map((item, index) => (
            <WeekDay
              key={index}
              date={item.date}
              day={item.day}
              isSelected={item.fullDate.toDateString() === selectedDate.toDateString()}
              onPress={() => setSelectedDate(item.fullDate)}
            />
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.mealListContainer}
      >
        {Object.entries(meals).map(([date, mealList], index) => (
          <DaySection
            key={index}
            date={date}
            meals={mealList}
            onAddMeal={() => handleAddMeal(date)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 16,
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  weekView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  weekDay: {
    alignItems: 'center',
    padding: 10,
    flex: 1,
  },
  selectedWeekDay: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  weekDayText: {
    fontSize: 12,
    color: '#666',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    color: '#000',
  },
  selectedWeekDayText: {
    color: 'white',
  },
  mealListContainer: {
    flex: 1,
  },
  daySection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  daySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  plusButton: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  mealContent: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  mealInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noMealsText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CalendarPage;