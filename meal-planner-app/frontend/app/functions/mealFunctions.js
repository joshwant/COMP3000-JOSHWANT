import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Function to delete a meal from Firestore
export const deleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'mealPlans', mealId));
    console.log('Meal deleted successfully');
    return true; // success
  } catch (error) {
    console.error('Error deleting meal:', error);
    return false; // failure
  }
};

// Function to fetch meal details
export const fetchMealDetails = async (preloadedMealId) => {
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
    console.error('Error fetching meal details:', error);
    return null;
  }
};

export default { deleteMeal, fetchMealDetails };