import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

import { API_URL } from '../../config/config';
//const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
//const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.173:5000';

// Fetch shopping list from Firestore
export const fetchShoppingList = async (userId) => {
  try {
    const q = query(collection(db, 'shoppingLists'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return [];
  }
};

// Add an item to Firestore
export const addShoppingListItem = async (item, userId) => {
  try {
    // Get product matches from your backend
    const matchResponse = await fetch(`${API_URL}/api/match-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: item.name }),
    });

    // Check if the response is successful
    if (!matchResponse.ok) {
      console.error('Failed to fetch match data:', matchResponse.statusText);
      throw new Error(`Failed to fetch match data: ${matchResponse.statusText}`);
    }

    const matchData = await matchResponse.json();

    // Prepare Firestore document
    const itemData = {
      ...item,
      userId,
      createdAt: new Date(),
      matchResult: matchData?.selected_candidate || {
        selected_candidate: null,
        confidence: 0,
        message: matchData.message || 'No good match found',
      },
    };

    // Save to Firestore
    const newItemRef = await addDoc(collection(db, 'shoppingLists'), itemData);
    return { id: newItemRef.id, ...itemData };

  } catch (error) {
    console.error('Error adding item:', error);
    alert(`Error: ${error.message}`);
    return null;
  }
};

// Delete an item from Firestore
export const deleteShoppingListItem = async (itemId) => {
  try {
    const itemRef = doc(db, 'shoppingLists', itemId);
    await deleteDoc(itemRef);
    console.log(`Item with ID ${itemId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Error deleting item with ID ${itemId}:`, error);
    return false;
  }
};

// Update item in Firestore
export const updateShoppingListItem = async (itemId, updateData) => {
  try {
    const itemRef = doc(db, 'shoppingLists', itemId);
    await updateDoc(itemRef, updateData);
    console.log(`Item with ID ${itemId} updated successfully.`);
    return true;
  } catch (error) {
    console.error(`Error updating item with ID ${itemId}:`, error);
    return false;
  }
};

export default { fetchShoppingList, addShoppingListItem, deleteShoppingListItem };