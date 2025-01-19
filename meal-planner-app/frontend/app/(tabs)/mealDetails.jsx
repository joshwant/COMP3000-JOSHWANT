import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';

const MealDetails = ({ route }) => {
  const { mealId } = route.params; // Gets the mealId from navigation params
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
        );
        const data = await response.json();
        if (data.meals) {
          setMeal(data.meals[0]);
        } else {
          setError('Meal not found');
        }
      } catch (error) {
        console.error('Error fetching meal details:', error);
        setError('Failed to load meal details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetails();
  }, [mealId]);

  const getIngredientsList = () => {
    if (!meal) return [];
    const ingredients = [];

    let i = 1;
    while (meal[`strIngredient${i}`]) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`] || '';

      if (ingredient.trim()) {
        const formattedIngredient = measure.trim()
          ? `${measure.trim()} ${ingredient.trim()}`
          : ingredient.trim();
        ingredients.push(formattedIngredient);
      }
      i++;
    }
    return ingredients;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {meal && (
        <>
          <Image source={{ uri: meal.strMealThumb }} style={styles.image} />

          <Text style={styles.areaCategory}>{meal.strArea} • {meal.strCategory}</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
              onPress={() => setActiveTab('ingredients')}
            >
              <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>
                Ingredients
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'instructions' && styles.activeTab]}
              onPress={() => setActiveTab('instructions')}
            >
              <Text style={[styles.tabText, activeTab === 'instructions' && styles.activeTabText]}>
                Instructions
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'ingredients' ? (
            <View style={styles.contentContainer}>
              {getIngredientsList().map((ingredient, index) => (
                <Text key={index} style={styles.ingredientText}>• {ingredient}</Text>
              ))}
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <Text style={styles.instructions}>{meal.strInstructions}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default MealDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  areaCategory: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  contentContainer: {
    paddingHorizontal: 4,
  },
  ingredientText: {
    fontSize: 16,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 16,
    color: 'black',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});