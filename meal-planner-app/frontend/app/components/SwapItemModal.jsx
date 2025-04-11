import React, { useState, useEffect } from 'react';
import {View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const SwapItemModal = ({visible, onClose, selectedStore, currentItemName, onConfirmSwap, API_URL}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchAlternativeProducts = async () => {
    if (!query.trim()) return;
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
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <AntDesign name="close" size={20} color="gray" style={styles.clearIcon} />
              </TouchableOpacity>
            )}
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
                    <Text style={styles.noResultsText}>No products found</Text>
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
    marginBottom: 14,
    textAlign: 'center',
    color: 'black',
  },
  currentItemText: {
    fontSize: 16,
    marginBottom: 14,
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
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
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
  resultsContainer: {
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productThumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
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
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
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