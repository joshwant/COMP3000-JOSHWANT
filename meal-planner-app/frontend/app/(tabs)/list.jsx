import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';
import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const List = () => {
  const [shoppingList, setShoppingList] = useState([]); // Holds shopping list items
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [newItem, setNewItem] = useState({ name: '', quantity: '', size: '' }); // New item data
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch shopping list items from Firestore
  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        if (!user) {
          console.error('User is not authenticated.');
          return;
        }

        // Query shoppingLists where userId matches the authenticated user
        const q = query(
          collection(db, 'shoppingLists'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShoppingList(items);
      } catch (error) {
          if (error.code === 'permission-denied') {
            console.error('Permission denied. Check Firestore rules or document fields.');
          } else {
            console.error('Error fetching shopping list:', error);
          }
        }
    };

    fetchShoppingList();
  }, [user]);


  // Add a new item to Firestore
  const addItemToFirestore = async () => {
    try {
      if (!user) return;

      // Ensure all fields are filled before attempting to write
      if (!newItem.name || !newItem.quantity || !newItem.size) {
        console.error("All fields must be filled before adding an item.");
        return;
      }

      // Add the document to Firestore with the userId field
      await addDoc(collection(db, 'shoppingLists'), {
        userId: user.uid, // Include userId to match security rules
        name: newItem.name,
        quantity: newItem.quantity,
        size: newItem.size,
        createdAt: new Date(),
      });

      // Refresh UI
      setShoppingList((prev) => [...prev, { ...newItem, userId: user.uid }]);
      setNewItem({ name: '', quantity: '', size: '' }); // Reset form
      setModalVisible(false); // Close modal
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>

      {/* Shopping List */}
      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>
              {item.name} - {item.quantity} ({item.size})
            </Text>
          </View>
        )}
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
            <TouchableOpacity style={styles.saveButton} onPress={addItemToFirestore}>
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
});
