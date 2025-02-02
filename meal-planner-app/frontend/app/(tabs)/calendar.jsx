import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
//Firebase
import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const WeekDay = ({ date, day, isSelected, onPress }) => (
  <Pressable
    style={[styles.weekDay, isSelected && styles.selectedWeekDay]}
    onPress={onPress}
  >
    <Text style={[styles.weekDayText, isSelected && styles.selectedWeekDayText]}>{day}</Text>
    <Text style={[styles.dateText, isSelected && styles.selectedWeekDayText]}>{date}</Text>
  </Pressable>
);

const MealItem = ({ title, type, image, area, category, preloadedMealId, navigation }) => (
  <Pressable onPress={() => navigation.navigate('meal-details', { mealId: preloadedMealId })}>
    <View style={styles.mealItem}>
      <Image source={{ uri: image }} style={styles.mealImage} />
      <View style={styles.mealContent}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealInfo}>{area} • {category}</Text>
      </View>
    </View>
  </Pressable>
);

const fetchPreloadedMealDetails = async (preloadedMealId) => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${preloadedMealId}`
      );
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        return data.meals[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching preloaded meal details:', error);
      return null;
    }
};

const DaySection = ({ date, meals, onAddMeal, navigation }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.includes('TODAY');
  const [mealDetails, setMealDetails] = useState({});

  useEffect(() => {
      const fetchMealsDetails = async () => {
        const details = {};
        for (const meal of meals) {
          if (!meal.isOwnMeal && meal.preloadedMealId) {
            const mealData = await fetchPreloadedMealDetails(meal.preloadedMealId);
            if (mealData) {
              details[meal.preloadedMealId] = mealData;
            }
          }
        }
        setMealDetails(details);
      };

      fetchMealsDetails();
  }, [meals]);

  return (
    <View style={[
      styles.daySection,
      isToday && { backgroundColor: 'rgba(0, 122, 255, 0.1)' }
    ]}>
      <View style={styles.daySectionHeader}>
        <Text style={styles.daySectionTitle}>{date}</Text>
        <Pressable onPress={onAddMeal}>
          <Text style={styles.plusButton}>+</Text>
        </Pressable>
      </View>
      <View>
        {meals.length > 0 ? (
          meals.map((meal, index) => {
            if (meal.isOwnMeal) {
              // Custom meal
              return (
                <MealItem
                  key={index}
                  title={meal.name || 'Custom Meal'}
                  type="Custom"
                  image="https://via.placeholder.com/100" // placeholder image for custom meals
                  area="Custom"
                  category="Custom"
                  preloadedMealId={meal.preloadedMealId} // pass the preloadedMealId
                  navigation={navigation} // pass the navigation prop
                />
              );
            } else {
              // Preloaded meal
              const mealData = mealDetails[meal.preloadedMealId];
              return (
                <MealItem
                  key={index}
                  title={mealData?.strMeal || `Meal ID: ${meal.preloadedMealId}`}
                  type="Preloaded"
                  image={mealData?.strMealThumb || 'https://placehold.co/400'}
                  area={mealData?.strArea || 'Unknown'}
                  category={mealData?.strCategory || 'Unknown'}
                  preloadedMealId={mealData?.idMeal || meal.preloadedMealId} // pass preloadedMealId for preloaded meal
                  navigation={navigation} // pass navigation
                />
              );
            }
          })
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
  const [meals, setMeals] = useState({});

  //Firebase authentication
  const auth = getAuth();
  const user = auth.currentUser;

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

  const generateMealsObject = (meals) => {
    const mealsObj = {};
    weekDays.forEach(({ fullDate }) => {
        const dateKey = formatSectionDate(fullDate);
        const dateString = fullDate.toISOString().split('T')[0]; // format the date properly
        mealsObj[dateKey] = meals[dateString] || []; // show meals from database if available
      });
    return mealsObj;
  };

  //fetching meals from database
  const fetchMeals = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'mealPlans'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      const mealsData = {};
      querySnapshot.forEach((doc) => {
        const meal = doc.data();
        const mealDate = new Date(meal.mealDate).toISOString().split('T')[0]; // Group by date

        if (!mealsData[mealDate]) {
          mealsData[mealDate] = [];
        }
        mealsData[mealDate].push(meal);
      });
      setMeals(mealsData);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
        fetchMeals();
    }, [user])
  );

  useEffect(() => {
    fetchMeals();
  }, [user]);

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

  const handleAddMeal = (date) => {
    //need to add popup here and functionality
    console.log('Add meal for:', date);
  };

  const mealsForDisplay = generateMealsObject(meals);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Planner</Text>

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

      <ScrollView ref={scrollViewRef} style={styles.mealListContainer}>
        {Object.entries(mealsForDisplay).map(([date, mealList], index) => (
          <DaySection
            key={index}
            date={date}
            meals={mealList}
            onAddMeal={() => handleAddMeal(date)}
            navigation={navigation}
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
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default CalendarPage;