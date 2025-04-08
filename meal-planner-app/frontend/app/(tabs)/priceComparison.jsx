import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import PriceComparisonCard from '../components/PriceComparisonCard';
import { getAuth } from 'firebase/auth';
import { fetchShoppingList } from '../functions/shoppingFunctions';
import { useCallback } from 'react';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';

const PriceComparison = () => {
  const [selectedStore, setSelectedStore] = useState('Tesco'); // Default store
  const [comparisonItems, setComparisonItems] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //Firebase Auth
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch shopping list from Firebase on mount
  useEffect(() => {
      if (!user) return;

      setIsLoading(true);

      const q = query(collection(db, 'shoppingLists'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setShoppingList(prev => {
          if (items.length > prev.length) {
            const newItems = items.slice(prev.length);
            processNewItems(newItems);
          }
          return items;
        });
        setIsLoading(false);
      });

      return () => unsubscribe();
    }, [user]);

  const processNewItems = async (newItems) => {
    const newComparisonItems = await Promise.all(newItems.map(async (shopItem) => {
      if (shopItem.matchResult?.selected_candidate) {
        const candidate = shopItem.matchResult.selected_candidate;
        const productImage = selectedStore === 'Tesco' ? candidate.tescoImageUrl : candidate.sainsburysImageUrl;
        const unitPrice = selectedStore === 'Tesco' ? candidate.tescoPricePerUnit : candidate.sainsburysPricePerUnit;
        return {
          id: shopItem.id,
          itemName: shopItem.name,
          quantity: shopItem.quantity,
          productName: selectedStore === 'Tesco' ? candidate.tesco_name : candidate.sainsburys_name,
          productPrice: selectedStore === 'Tesco' ? candidate.tesco_price : candidate.sainsburys_price,
          productImage,
          unitPrice,
          notFound: false,
        };
      }
      // If no candidate - mark as unmatched
      return {
        id: shopItem.id,
        itemName: shopItem.name,
        quantity: shopItem.quantity,
        notFound: true,
      };
    }));

    const sortedNew = newComparisonItems.sort((a, b) => {
      if (a.notFound === b.notFound) return 0;
      return a.notFound ? -1 : 1;
    });

    setComparisonItems(prev => {
      const existingIds = new Set(prev.map(i => i.id));
      const filteredNew = newComparisonItems.filter(item => !existingIds.has(item.id));
      return [...prev, ...filteredNew];
    });
  };

  // Refresh function
  const handleRefresh = useCallback(async () => {
    const updatedItems = await Promise.all(shoppingList.map(shopItem => {
      // Use the matched product data if available
      if (shopItem.matchResult?.selected_candidate) {
        const candidate = shopItem.matchResult.selected_candidate;
        const productImage = selectedStore === 'Tesco' ? candidate.tescoImageUrl : candidate.sainsburysImageUrl;
        const unitPrice = selectedStore === 'Tesco' ? candidate.tescoPricePerUnit : candidate.sainsburysPricePerUnit;
        return {
          id: shopItem.id,
          itemName: shopItem.name,
          quantity: shopItem.quantity,
          productName: selectedStore === 'Tesco' ? candidate.tesco_name : candidate.sainsburys_name,
          productPrice: selectedStore === 'Tesco' ? candidate.tesco_price : candidate.sainsburys_price,
          productImage,
          unitPrice,
          notFound: false,
        };
      }
      return {
        id: shopItem.id,
        itemName: shopItem.name,
        quantity: shopItem.quantity,
        notFound: true,
      };
    }));

    // Sort updated items with unmatched ones at the top
    const sortedUpdated = updatedItems.sort((a, b) => {
      if (a.notFound === b.notFound) return 0;
      return a.notFound ? -1 : 1;
    });

    setComparisonItems(updatedItems);
  }, [shoppingList, selectedStore]);

  useEffect(() => {
    if (shoppingList.length > 0) {
      handleRefresh();
    }
  }, [selectedStore]);

  const totalPrice = comparisonItems.reduce((sum, item) => {
    if (!item.notFound && item.productPrice) {
      // Handle both "85p" and "£0.85" formats
      const priceStr = String(item.productPrice);
      let unit = 0;
      if (priceStr.includes('£')) {
        unit = parseFloat(priceStr.replace('£', '')) || 0;
      } else if (priceStr.includes('p')) {
        unit = parseFloat(priceStr.replace('p', '')) / 100 || 0;
      }
      const qty = parseInt(item.quantity) || 1;
      return sum + (unit * qty);
    }
    return sum;
  }, 0).toFixed(2);

  const anyUnmatched = comparisonItems.some(item => item.notFound);

  const storeOptions = [
    { label: 'Tesco', value: 'Tesco' },
    { label: "Sainsbury's", value: "Sainsbury's" },
  ];

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const selectStore = (value) => {
    setSelectedStore(value);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Price Comparison</Text>
      </View>

      <View style={styles.sortOptions}>
        <View>
          <Text style={styles.totalItemsLabel}>Total Items</Text>
          <Text style={styles.totalItemsValue}>{shoppingList.length} items</Text>
        </View>

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={toggleDropdown}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownButtonText}>{selectedStore}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View style={styles.dropdownOptions}>
              {storeOptions.map((store) => (
                <TouchableOpacity
                  key={store.value}
                  style={[
                    styles.optionItem,
                    selectedStore === store.value && styles.selectedOption
                  ]}
                  onPress={() => selectStore(store.value)}
                >
                  <Text style={styles.optionText}>{store.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#00B21E" />
      ) : (
        <ScrollView style={styles.scrollContainer}
        refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await handleRefresh();
                setRefreshing(false);
              }}
            />
          }
        >
        {comparisonItems.map((item, index) => (
          <PriceComparisonCard
            key={`${item.id}-${index}`}
            itemName={item.itemName}
            quantity={item.quantity}
            productName={item.productName}
            productPrice={item.productPrice}
            productImage={item.productImage}
            unitPrice={item.unitPrice}
            notFound={item.notFound}
          />
        ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalLabel}>Total at {selectedStore}</Text>
          <Text style={styles.totalAmount}>£{totalPrice}</Text>
        </View>
        {anyUnmatched && (
          <Text style={styles.unmatchedNote}>
            * Some items are unmatched so the total price may not be accurate.
          </Text>
        )}
      </View>

    </View>
  )
}

export default PriceComparison;

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
  totalItemsLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalItemsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sortOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    minWidth: 150,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownOptions: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedOption: {
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unmatchedNote: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
    fontStyle: 'italic',
  },
})