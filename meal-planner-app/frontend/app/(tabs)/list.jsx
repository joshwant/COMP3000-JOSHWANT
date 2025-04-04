import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, SectionList } from 'react-native';
import { getAuth } from 'firebase/auth';
import { SwipeListView } from 'react-native-swipe-list-view';
import { fetchShoppingList, addShoppingListItem, deleteShoppingListItem } from '../functions/shoppingFunctions';
import { Picker } from '@react-native-picker/picker';
import { Dropdown } from 'react-native-element-dropdown';

const categories = [
  'Produce',
  'Meat',
  'Dairy',
  'Bakery',
  'Frozen Foods',
  'Pantry',
  'Beverages',
  'Snacks',
  'Other',
];

const List = () => {
  const [shoppingList, setShoppingList] = useState([]); // Holds shopping list items
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [newItem, setNewItem] = useState({ name: '', quantity: '', size: '', category: 'Other' }); // New item data
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
      setNewItem({ name: '', quantity: '', size: '', category: 'Other' });
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

  // Convert shoppingList into sections
  const sections = Object.entries(
    shoppingList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {})
  ).map(([category, data]) => ({ title: category, data }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.categoryHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemText}>
                {item.name} - {item.quantity} ({item.size})
              </Text>
              {item.matchResult?.selected_candidate ? (
                <Text style={styles.matchText}>
                  Match: {item.matchResult.selected_candidate.generic_name}
                </Text>
              ) : (
                <Text style={styles.noMatchText}>No match found</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        stickySectionHeadersEnabled={false}
      />

      {/* Add Item Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>

            <TextInput
              style={styles.input}
              placeholder="Name (e.g., Mince)"
              placeholderTextColor="gray"
              value={newItem.name}
              onChangeText={(text) => setNewItem((prev) => ({ ...prev, name: text }))}
            />

            <TextInput
              style={[styles.input, { color: 'black' }]}
              placeholder="Quantity (e.g., 2)"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={newItem.quantity}
              onChangeText={(text) => setNewItem((prev) => ({ ...prev, quantity: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Size (e.g., 500g)"
              placeholderTextColor="gray"
              value={newItem.size}
              onChangeText={(text) => setNewItem((prev) => ({ ...prev, size: text }))}
            />

            <Dropdown
              style={styles.dropdown}
              data={categories.map((cat) => ({ label: cat, value: cat }))}
              labelField="label"
              valueField="value"
              value={newItem.category}
              onChange={(item) => setNewItem((prev) => ({ ...prev, category: item.value }))}
              containerStyle={styles.dropdownContainer}
              selectedTextStyle={styles.selectedText}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
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
    backgroundColor: '#00B21E',
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
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  dropdown: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  dropdownContainer: {
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 16,
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#00B21E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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
    color: '#00B21E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'grey',
    paddingTop: 10,
  },
  matchText: {
    fontSize: 12,
    color: 'green',
  },
  noMatchText: {
    fontSize: 12,
    color: 'red',
  }
});
