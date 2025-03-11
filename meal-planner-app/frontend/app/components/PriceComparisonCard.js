import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const PriceComparisonCard = ({ itemName, quantity, productName, productPrice, notFound }) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{itemName}</Text>
        <Text style={styles.itemNeed}>Need: {quantity}</Text>

        {notFound ? (
          <Text style={styles.notFoundText}>Item could not be found at store</Text>
        ) : (
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.productPrice}>{productPrice}</Text>
          </View>
        )}

        {/* Keeping unit price hardcoded for now */}
        <Text style={styles.unitPrice}>£0.31/piece</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.swapButton}>
            <Text style={styles.swapButtonText}>↔ Swap Item</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemImage}>
        <Image
          source={{ uri: 'https://www.themealdb.com/images/ingredients/banana.png' }} // Hardcoded image for now
          style={styles.productImage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemNeed: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  unitPrice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  notFoundText: {
    fontSize: 14,
    color: 'red',
    marginBottom: 10,
  },
  swapButton: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  swapButtonText: {
    color: '#333',
    fontSize: 14,
  },
  itemImage: {
    width: 70,
    height: 70,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
});

export default PriceComparisonCard;
