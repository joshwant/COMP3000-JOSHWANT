import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';
import { getAuth } from 'firebase/auth';
import { SwipeListView } from 'react-native-swipe-list-view';
import { fetchShoppingList, addShoppingListItem, deleteShoppingListItem } from '../functions/shoppingFunctions';

const List = () => {
  const [shoppingList, setShoppingList] = useState([]); // Holds shopping list items
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [newItem, setNewItem] = useState({ name: '', quantity: '', size: '' }); // New item data
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch shopping list items from Firestore
  useEffect(() => {
    const loadShoppingList = async () => {
      if (user) {
        const items = await fetchShoppingList(user.uid);
        setShoppingList(items);
      }
    };

    loadShoppingList();
  }, [user]);

  // Add a new item to Firestore
  const handleAddItem = async () => {
    if (!user) return;
    const addedItem = await addShoppingListItem(newItem, user.uid);

    if (addedItem) {
      setShoppingList((prevList) => [...prevList, addedItem]);
      setNewItem({ name: '', quantity: '', size: '' });
      setModalVisible(false);
    }
  };

  // Delete an item from Firestore
  const handleDeleteItem = async (itemId) => {
    const success = await deleteShoppingListItem(itemId);

    if (success) {
      setShoppingList((prevList) => prevList.filter((item) => item.id !== itemId));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>

      {/* Shopping List */}
      <SwipeListView
        data={shoppingList}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>
              {item.name} - {item.quantity} ({item.size})
            </Text>
          </View>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.hiddenItem}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-75} // how far the item swipes to reveal delete button
        disableRightSwipe={true}
      />

      {/* Add Item Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal visible={isModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (e.g., Mince)"
              value={newItem.name}
              onChangeText={(text) => setNewItem((prev) => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity (e.g., 2)"
              keyboardType="numeric"
              value={newItem.quantity}
              onChangeText={(text) => setNewItem((prev) => ({ ...prev, quantity: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Size (e.g., 500g)"
              value={newItem.size}
              onChangeText={(text) => setNewItem((prev) => ({ ...prev, size: text }))}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddItem}>
              <Text style={styles.saveButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default List;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
  //Add item:
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 34,
    color: 'white',
    paddingBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
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
  //Delete item:
  hiddenItem: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
    backgroundColor: 'transparent',
  },
  deleteButton: {
    width: 75,
    height: '100%',
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
