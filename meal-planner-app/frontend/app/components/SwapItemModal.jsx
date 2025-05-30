import React, { useState, useEffect } from 'react';
import {View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet, Keyboard} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const SwapItemModal = ({visible, onClose, selectedStore, currentItemName, onConfirmSwap, API_URL}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchAlternativeProducts = async () => {
    if (query.trim().length < 3) return;

    Keyboard.dismiss();

    setIsSearching(true);
    try {
      const searchStore = selectedStore.toLowerCase() === 'tesco' ? 'tesco' : "sainsburys";
      const url = `${API_URL}/api/search-products?store=${searchStore}&q=${encodeURIComponent(query)}`;
      console.log("Searching in store:", searchStore);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setResults(data.products || []);
    } catch (error) {
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        url: url
      });
      alert(`Search failed: ${error.message}`);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Swap Item at {selectedStore}</Text>
          <Text style={styles.currentItemText}>Current: {currentItemName}</Text>

          <View style={styles.searchContainer}>
            <AntDesign name="search1" size={20} color="gray" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search for alternatives`}
              placeholderTextColor="gray"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={searchAlternativeProducts}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <AntDesign name="close" size={20} color="gray" style={styles.clearIcon} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.searchButton,
                query.trim().length < 3 && styles.disabledButton
              ]}
              onPress={searchAlternativeProducts}
              disabled={query.trim().length < 3}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {isSearching ? (
            <ActivityIndicator size="large" color="#00B21E" />
          ) : (
            <ScrollView style={styles.resultsContainer}>
              {results.length > 0 ? (
                  results.map((product, index) => (
                    <TouchableOpacity
                      key={`${index}_${product.name}`}
                      style={styles.productItem}
                      onPress={async () => {
                        await onConfirmSwap(product);
                        onClose();
                      }}
                    >
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productThumbnail}
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                        <Text style={styles.productPrice}>{product.price}</Text>
                        <Text style={styles.productUnitPrice}>{product.pricePerUnit}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>
                      {query.length > 0 ? 'No products found' : 'Search for alternatives'}
                    </Text>
                  </View>
                )}
            </ScrollView>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: 'black',
  },
  currentItemText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#666',
  },
  searchContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingLeft: 10,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    color: 'black',
  },
  clearIcon: {
    marginLeft: 10,
    padding: 5,
  },
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#00B21E',
    borderRadius: 8,
    justifyContent: 'center',
  },
  disabledButton: {
    color: 'white',
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B21E',
  },
  productUnitPrice: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#00B21E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SwapItemModal;