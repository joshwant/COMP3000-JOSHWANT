import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

const SwapItemModal = ({
  visible,
  onClose,
  selectedStore,
  currentItemName,
  onConfirmSwap,
  API_URL
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchAlternativeProducts = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const url = `${API_URL}/api/search-products?store=${encodeURIComponent(selectedStore)}&q=${encodeURIComponent(query)}`;
      console.log("Attempting to fetch:", url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log("Response status:", response.status);
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
            <TextInput
              style={styles.searchInput}
              placeholder={`Search for alternatives at ${selectedStore}...`}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={searchAlternativeProducts}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={searchAlternativeProducts}
            >
              <Text>Search</Text>
            </TouchableOpacity>
          </View>

          {isSearching ? (
            <ActivityIndicator size="large" color="#00B21E" />
          ) : (
            <ScrollView style={styles.resultsContainer}>
              {results.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.productItem}
                  onPress={() => {
                    onConfirmSwap(product);
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
              ))}
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
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  currentItemText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
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
});

export default SwapItemModal;