import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const PriceComparisonCard = ({ itemName, quantity, productName, productPrice, productImage, unitPrice, notFound, onSwapPress }) => {

    const getNumericPrice = (price) => {
      if (!price) return 0;
      if (price.includes('£')) {
        return parseFloat(price.replace('£', ''));
      } else if (price.includes('p')) {
        return parseFloat(price.replace('p', '')) / 100;
      }
      return parseFloat(price);
    };

    const numericPrice = getNumericPrice(productPrice);
    const numericQuantity = parseInt(quantity) || 1;
    const extendedPrice = numericPrice * numericQuantity;

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
            <Text style={styles.productPrice}>£{extendedPrice.toFixed(2)}</Text>
          </View>
        )}

        {!notFound && (
          <Text style={styles.unitPrice}>
            {productPrice} each ({unitPrice})
          </Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.swapButton} onPress={onSwapPress}>
            <Text style={styles.swapButtonText}>↔ Swap Item</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemImage}>
        <Image
          source={{ uri: productImage }} // Dynamic images that were taken from scraper
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
