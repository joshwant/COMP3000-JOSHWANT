import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'

const PriceComparison = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Price Comparison</Text>
      </View>

      <View style={styles.totalItems}>
        <Text style={styles.totalItemsLabel}>Total Items</Text>
        <Text style={styles.totalItemsValue}>12 items</Text>
      </View>

      <View style={styles.sortOptions}>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>↕ Price</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>↕ Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreOptionsButton}>
          <View style={styles.storeSelector}><Text>Tesco</Text> </View>
        </TouchableOpacity>
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
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonIcon}>🔍</Text>
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
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonIcon}>🔍</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.itemImage}>
            <Image source={{uri: 'https://www.themealdb.com/images/ingredients/milk.png'}} style={styles.productImage} />
          </View>
        </View>

        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalLabel}>Total at Tesco</Text>
          <Text style={styles.totalAmount}>£42.85</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Refresh Price Comparison</Text>
        </TouchableOpacity>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  storeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    width: 100,
    justifyContent: 'space-between',
  },
  totalItems: {
    marginBottom: 15,
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
    marginBottom: 15,
    alignItems: 'center',
  },
  sortButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    marginRight: 10,
  },
  sortButtonText: {
    fontWeight: '500',
  },
  moreOptionsButton: {
    marginLeft: 'auto',
  },
  moreOptionsIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  actionButtons: {
    flexDirection: 'row',
  },
  swapButton: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  swapButtonText: {
    color: '#333',
    fontSize: 14,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonIcon: {
    fontSize: 16,
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
    marginTop: 20,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
})