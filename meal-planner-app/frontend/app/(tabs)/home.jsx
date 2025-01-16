import {
  View, Text, StyleSheet, Pressable, FlatList, Image, Alert, ActivityIndicator, TextInput, ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import logout from '../auth/logout.jsx';

const Home = () => {
  const [meals, setMeals] = useState([]);
  const [usedMealIds, setUsedMealIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();
    if (data.meals) {
        setMeals(data.meals);
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
      setSearchQuery('');
      setIsSearching(false);
      setMeals([]);
      fetchAllRecipes(false);
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
    handleSearch('');
  };

  useEffect(() => {
    if (!isSearching) {
      fetchAllRecipes(true);
    }
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => searchMeals(searchQuery), 500);
      return () => clearTimeout(timeoutId); // Cleanup
    }
    fetchCategories();
  }, [isSearching, searchQuery]);

  const fetchAllRecipes = async (isInitialLoad = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=');
      const data = await response.json();

      if (data.meals) {
        const availableMeals = data.meals.filter((meal) => !usedMealIds.has(meal.idMeal));

        if (availableMeals.length === 0) {
          setLoading(false);
          return;
        }

        // Generate random number between 7 and 15 for number of items to show
        const randomCount = Math.floor(Math.random() * (15 - 7 + 1)) + 7;
        const shuffledMeals = [...availableMeals].sort(() => Math.random() - 0.5);
        const randomMeals = shuffledMeals.slice(0, randomCount);

        const newUsedMealIds = new Set(usedMealIds);
        randomMeals.forEach((meal) => newUsedMealIds.add(meal.idMeal));
        setUsedMealIds(newUsedMealIds);

        if (isInitialLoad) {
          setMeals((prevMeals) => [...prevMeals, ...randomMeals]);
        } else {
          setMeals(randomMeals);
        }
      } else {
        setError('No meals found');
      }
    } catch (error) {
      console.error('Error fetching all meals:', error);
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

  const renderMealCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.strMealThumb }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{item.strMeal}</Text>
      {item.strCategory && <Text style={styles.cardCategory}>{item.strCategory}</Text>}
    </View>
  );

  const renderCategoryButtons = () => (
    <View style={{ height: 55 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer} contentContainerStyle={{ alignItems: 'center' }}>
        <Pressable
          style={styles.categoryButton}
          onPress={() => fetchAllRecipes(false)}
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
    if (!loading && meals.length > 0) {
      const totalLoadedMeals = usedMealIds.size; // track total meals loaded
      if (totalLoadedMeals < 500) { // limit to prevent excessive API calls
        setPage((prev) => prev + 1);
        fetchAllRecipes(true);
      }
    }
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
            loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
          }
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
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
    flex: 1,
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
});
