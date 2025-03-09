import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';

const PriceComparison = () => {
  const [selectedStore, setSelectedStore] = useState('Tesco'); // Default store

  const storeOptions = [
    { label: 'Tesco', value: 'Tesco' },
    { label: "Sainsbury's", value: "Sainsbury's" },
    { label: 'Aldi', value: 'Aldi' },
    { label: 'Morrisons', value: 'Morrisons' },
    { label: 'ASDA', value: 'ASDA' },
  ];

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Price Comparison</Text>
      </View>

      <View style={styles.sortOptions}>
        <View>
          <Text style={styles.totalItemsLabel}>Total Items</Text>
          <Text style={styles.totalItemsValue}>12 items</Text>
        </View>
        <Dropdown
          style={styles.dropdown}
          data={storeOptions}
          labelField="label"
          valueField="value"
          value={selectedStore}
          onChange={item => setSelectedStore(item.value)}
          containerStyle={styles.dropdownContainer}
          selectedTextStyle={styles.selectedText}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.itemContainer}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>Organic Bananas</Text>
            <Text style={styles.itemNeed}>Need: 6 pieces</Text>

            <View style={styles.productDetails}>
              <Text style={styles.productName}>Tesco Organic Bananas 6pk</Text>
              <Text style={styles.productPrice}>£1.85</Text>
            </View>
            <Text style={styles.unitPrice}>£0.31/piece</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.swapButton}>
                <Text style={styles.swapButtonText}>↔ Swap Item</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.itemImage}>
            <Image source={{uri: 'https://www.themealdb.com/images/ingredients/banana.png'}} style={styles.productImage} />
          </View>
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>Whole Milk</Text>
            <Text style={styles.itemNeed}>Need: 2 liters</Text>

            <View style={styles.productDetails}>
              <Text style={styles.productName}>Tesco British Whole Milk 2L</Text>
              <Text style={styles.productPrice}>£1.95</Text>
            </View>
            <Text style={styles.unitPrice}>£0.98/L</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.swapButton}>
                <Text style={styles.swapButtonText}>↔ Swap Item</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.itemImage}>
            <Image source={{uri: 'https://www.themealdb.com/images/ingredients/milk.png'}} style={styles.productImage} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalLabel}>Total at {selectedStore}</Text>
          <Text style={styles.totalAmount}>£42.85</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Refresh Price Comparison</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PriceComparison

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
    marginBottom: 15,
  },
  dropdown: {
    width: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
    marginLeft: 'auto',
  },
  dropdownContainer: {
    borderRadius: 4,
  },
  selectedText: {
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
  },
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
  swapButton: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    flex: 1,
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
  refreshButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
})