import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

const CalendarPage = () => {
  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState('');
  const [meals, setMeals] = useState([
    // Sample data for meals for UI testing
    { id: '1', name: 'Chicken Salad', description: 'Healthy chicken salad with vegetables' },
    { id: '2', name: 'Pasta', description: 'Creamy pasta with cheese and tomatoes' },
  ]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  return (
    <View style={styles.container}>

      {/* Horizontal calendar */}
      <Calendar
        current={selectedDate}
        horizontal={true}
        pagingEnabled={true}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: 'blue', selectedTextColor: 'white' },
        }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          selectedDayBackgroundColor: 'blue',
          todayTextColor: 'red',
          arrowColor: 'blue',
        }}
      />

      {/* Today's Date and Meals */}
      <View style={styles.mealSection}>
        <Text style={styles.todayText}>Today - {selectedDate}</Text>
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.mealCard}>
              <Text style={styles.mealTitle}>{item.name}</Text>
              <Text>{item.description}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default CalendarPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  mealSection: {
    marginTop: 20,
  },
  todayText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mealCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
