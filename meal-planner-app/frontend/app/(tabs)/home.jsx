import {
  View, Text, StyleSheet, Pressable, FlatList, Image, Alert, ActivityIndicator, TextInput, ScrollView, Dimensions, Modal, TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import logout from '../auth/logout.jsx';
import MealDetails from '../(tabs)/mealDetails.jsx';

const Home = ({navigation}) => {
  const [meals, setMeals] = useState([]);
  const [usedMealIds, setUsedMealIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewingCategory, setIsViewingCategory] = useState(false);
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  // Add to calendar popup
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get meal categories
  const fetchCategories = async () => {
    try {
    setLoading(true);
    setError(null);
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
    const data = await response.json();
    if(data.categories) {
        setCategories(data.categories);
    } else{
        setError('No categories found');
      }
    } catch(error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
  };

  // Fetch meals by category
  const fetchMealsByCategory = async (category) => {
   try {
    setLoading(true);
    setError(null);
    setMeals([]);
    setIsViewingCategory(true);

    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();
    if (data.meals) {
        const mealsWithCategory = data.meals.map(meal => ({
                ...meal,
                strCategory: category
              }));
        setMeals(mealsWithCategory);
    } else {
        setMeals([]);
        setError(`No meals found for category "${category}"`);
      }
    } catch (error) {
        console.error('Error fetching meals:', error);
        setError('Failed to fetch meals. Please try again.');
      } finally {
        setLoading(false);
        }
   };

  // Search function
  const searchMeals = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      const data = await response.json();
      if (data.meals) {
        setMeals(data.meals);
      } else {
        setMeals([]);
        setError('No meals found');
      }
    } catch (error) {
      console.error('Error searching meals:', error);
      setError('Failed to search meals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text.trim() === '') {
      clearSearch();
      return;
    }

    setIsSearching(true);

    // Debounce search (searches 500ms after user stops typing)
    const timeoutId = setTimeout(() => {
      searchMeals(text);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setMeals([]);
    fetchAllRecipes(true);
  };


  useEffect(() => {
    if (!isSearching) {
      fetchAllRecipes(true); // Only fetch all recipes if not searching
    }
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => searchMeals(searchQuery), 500);
      return () => clearTimeout(timeoutId); // Cleanup
    }
    fetchCategories();
  }, [isSearching, searchQuery]);

  const fetchAllRecipes = async (isInitialLoad = false) => {
    if (loading || page > 26 || isSearching) return;

    try {
      setLoading(true);
      setError(null);

      const letter = String.fromCharCode(96 + page);
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
      const data = await response.json();

      if (data.meals) {
        setMeals((prevMeals) => {
          // Filter out duplicates
          const newMeals = data.meals.filter(
            (newMeal) => !prevMeals.some((meal) => meal.idMeal === newMeal.idMeal)
          );
          return isInitialLoad ? newMeals : [...prevMeals, ...newMeals];
        });

        // Track used letters to prevent redundant fetching
        setUsedMealIds((prevIds) => {
          const newIds = new Set(prevIds);
          data.meals.forEach((meal) => newIds.add(meal.idMeal));
          return newIds;
        });
      } else if (!data.meals) {
        // Increment page if no meals are found for the letter
        if (page < 26) setPage((prevPage) => prevPage + 1);
        else setHasMoreData(false); // No more data to fetch
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError('Failed to load meals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Logged Out', 'You have been logged out successfully.');
      console.log('Logged out successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
      console.log('Error', error.message);
    }
  };

  const renderMealCard = ({ item }) => {
    const cardWidth = (Dimensions.get('window').width - 62) / 2;

    const handleAddMeal = () => {
      setSelectedMeal(item);
      setModalVisible(true);
    };

    return (
      <Pressable
        style={[styles.card, { width: cardWidth }]}
        onPress={() => navigation.navigate('meal-details', { mealId: item.idMeal, mealName: item.strMeal })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.strMealThumb }} style={styles.cardImage} />
          <Pressable
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddMeal();
            }}
          >
            <AntDesign name="plus" size={20} color="white" />
          </Pressable>
        </View>
        <Text style={styles.cardTitle}>{item.strMeal}</Text>
        {item.strCategory && <Text style={styles.cardCategory}>{item.strCategory}</Text>}
      </Pressable>
    );
  };

  const renderCategoryButtons = () => (
    <View style={{ height: 55 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer} contentContainerStyle={{ alignItems: 'center' }}>
        <Pressable
          style={styles.categoryButton}
          onPress={() => {
            setSearchQuery(''); // Clear any active search
            setIsSearching(false);
            setPage(1); // Sets all recipe page back to 1
            setError(null);
            setLoading(false);
            setMeals([]); // Clear list
            setIsViewingCategory(false);
            fetchAllRecipes(false);
          }}
        >
          <Text style={styles.categoryText}>All Recipes</Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category.idCategory}
            style={styles.categoryButton}
            onPress={() => fetchMealsByCategory(category.strCategory)}
          >
            <Text style={styles.categoryText}>{category.strCategory}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const loadMoreMeals = () => {
    if (!loading && hasMoreData && !isViewingCategory && !isSearching) {
      fetchAllRecipes(false);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const generateWeekDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay()); // Sunday

    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      week.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        date: date.getDate(),
        fullDate: date,
      });
    }
    return week;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello, Chef</Text>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <AntDesign name="logout" size={24} color="black" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search meals..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={clearSearch}>
            <AntDesign name="close" size={20} color="gray" style={styles.clearIcon} />
          </Pressable>
        )}
      </View>

      {/* Category Buttons */}
      {renderCategoryButtons()}

      {/* Meal List */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item, index) => `${item.idMeal}-${index}`}
          renderItem={renderMealCard}
          numColumns={2}
          contentContainerStyle={styles.list}
          onEndReached={loadMoreMeals}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && <ActivityIndicator size="large" color="blue" />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Meal Plan Modal */}
      <Modal visible={isModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Meal to Calendar</Text>

            {selectedMeal && (
                <View style={styles.mealInfoContainer}>
                  <Image
                    source={{ uri: selectedMeal.strMealThumb }}
                    style={styles.modalImage}
                  />
                  <View style={styles.mealTextContainer}>
                    <Text style={styles.modalMealName}>{selectedMeal.strMeal}</Text>
                    <Text style={styles.areaCategory}>
                      {selectedMeal.strArea} • {selectedMeal.strCategory}
                    </Text>
                  </View>
                </View>
            )}

            <Text style={styles.selectDayText}>Select Day:</Text>

            <View style={styles.calendarContainer}>
              {generateWeekDates().map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    selectedDate && selectedDate.toDateString() === item.fullDate.toDateString() && styles.selectedDay
                  ]}
                  onPress={() => setSelectedDate(item.fullDate)}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDate && selectedDate.toDateString() === item.fullDate.toDateString() && styles.selectedDateText
                  ]}>
                    {item.day}
                  </Text>
                  <Text style={[
                    styles.dateText,
                    selectedDate && selectedDate.toDateString() === item.fullDate.toDateString() && styles.selectedDateText
                  ]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                // need to add functionality
                console.log('Adding to meal plan:', selectedMeal?.strMeal);
                setModalVisible(false);
                setSelectedMeal(null);
              }}
            >
              <Text style={styles.saveButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                setSelectedMeal(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
  },

  searchContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 10,
    padding: 5,
  },

  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
    height: 50,
  },
  categoryButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    paddingBottom: 16,
  },

  card: {
    margin: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: 'lightgray',
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 4,
    color: 'black',
  },
  cardCategory: {
    fontSize: 14,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 14,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  mealInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  mealTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  modalMealName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  areaCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectDayText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  dayText: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedDateText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007bff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});
