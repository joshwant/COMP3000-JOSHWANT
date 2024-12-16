import {
  View, Text, StyleSheet, Pressable, FlatList, Image, Alert, ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import logout from '../auth/logout.jsx';

const Home = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

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
    if (page <= 26) {
      fetchMeals(page);
    }
  }, [page]);

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
