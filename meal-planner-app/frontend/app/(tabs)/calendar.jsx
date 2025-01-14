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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + index);
    return {
      day,
      date: date.getDate(),
      fullDate: date,
    };
  });

  const meals = {
    'TODAY - NOV 20': [
      { title: 'Chicken Burgers', duration: '30 Min', type: 'Chicken' }
    ],
    'TOMORROW - NOV 21': [],
    'FRIDAY - NOV 22': [
      { title: 'Bok Choy', duration: '15 Min', type: 'Vegan' },
      { title: 'Stir-Fry', duration: '30 Min', type: 'Beef' }
    ],
    'SATURDAY - NOV 23': []
  };

  const handleAddMeal = (date) => {
    // Implement your add meal logic here
    console.log('Adding meal for:', date);
  };

  return (
    <View style={styles.container}>
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

      <ScrollView style={styles.mealListContainer}>
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