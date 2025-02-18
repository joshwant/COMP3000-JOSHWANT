import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

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
    if (!userId) throw new Error('User ID is required to add an item.');
    if (!item.name || !item.quantity || !item.size) {
      throw new Error('All item fields must be filled.');
    }

    const newItemRef = await addDoc(collection(db, 'shoppingLists'), {
      ...item,
      userId,
      createdAt: new Date(),
    });
    return { id: newItemRef.id, ...item };
  } catch (error) {
    console.error('Error adding item:', error);
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
