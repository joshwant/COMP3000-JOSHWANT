import {
  View, Text, StyleSheet, Pressable, FlatList, Image, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import logout from '../auth/logout.jsx';

const Home = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);


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
    setIsSearching(true);

    if (text.trim() === '') {
      clearSearch();
      return;
    }

    // Debounce search (searches 500ms after user stops typing)
    const timeoutId = setTimeout(() => {
      searchMeals(text);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setPage(1);
    setMeals([]);
    fetchMeals(1);
  };

  const fetchMeals = async (pageNumber) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?f=${String.fromCharCode(
          96 + pageNumber
        )}` //Gets meals by first letter (a, b, c, ..)
      );
      const data = await response.json();
      if (data.meals) {
        setMeals((prevMeals) => {
          const newMeals = data.meals.filter(
            (newMeal) => !prevMeals.some((meal) => meal.idMeal === newMeal.idMeal)
          );
          return [...prevMeals, ...newMeals];
        });
      } else {
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError('Failed to load meals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (!isSearching && page <= 26) {
        fetchMeals(page);
      }
    }, [page, isSearching]);

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
      <Text style={styles.cardCategory}>{item.strCategory}</Text>
    </View>
  );

  const loadMoreMeals = () => {
    if (!loading && page < 26) {
      setPage((prevPage) => prevPage + 1);
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

      {/* Meal List */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.idMeal}
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
  list: {
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    color: 'black',
  },
  cardCategory: {
    fontSize: 14,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 8,
  },
});
