import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Dropdown } from 'react-native-element-dropdown';

import { loadCsvData } from '../helperFunctions/csvHelper';
import PriceComparisonCard from '../components/PriceComparisonCard';

const PriceComparison = () => {
  const [selectedStore, setSelectedStore] = useState('Tesco'); // Default store
  const [csvData, setCsvData] = useState([]);
  const [comparisonItems, setComparisonItems] = useState([]);

  // Dummy shopping list data
  const dummyShoppingList = [
    { id: '1', name: 'Butter', quantity: '1 pack' },
    { id: '2', name: 'Milk', quantity: '2 liters' },
    { id: '3', name: 'Banana', quantity: '6 pieces' },
  ];

  // Refresh function
  const handleRefresh = async () => {
    // Load CSV data first
    const loadedCsvData = await loadCsvData();
    setCsvData(loadedCsvData);
    console.log('CSV Data loaded:', loadedCsvData);

    const newComparisonItems = dummyShoppingList.map((shopItem) => {
      // Find a CSV item whose product name contains the shopping list item name
      const match = loadedCsvData.find((csvItem) =>
        csvItem["Product Name"].toLowerCase().includes(shopItem.name.toLowerCase())
      );

      if (match) {
        return {
          id: shopItem.id,
          itemName: shopItem.name,
          quantity: shopItem.quantity,
          productName: match["Product Name"],
          productPrice: match.Price,
          notFound: false,
        };
      } else {
        return {
          id: shopItem.id,
          itemName: shopItem.name,
          quantity: shopItem.quantity,
          notFound: true,
        };
      }
    });
    setComparisonItems(newComparisonItems);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

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
          <Text style={styles.totalItemsValue}>{dummyShoppingList.length} items</Text>
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
        {comparisonItems.map((item) => (
          <PriceComparisonCard
            key={item.id}
            itemName={item.itemName}
            quantity={item.quantity}
            productName={item.productName}
            productPrice={item.productPrice}
            notFound={item.notFound}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalLabel}>Total at {selectedStore}</Text>
          <Text style={styles.totalAmount}>£42.85</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
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
    backgroundColor: '#007bff',
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