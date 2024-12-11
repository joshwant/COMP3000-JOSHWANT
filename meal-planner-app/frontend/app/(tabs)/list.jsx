import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const list = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shopping List</Text>
    </View>
  )
}

export default list

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'white',
    },
    text: {
      color: 'white',
      fontSize: 42,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      marginBottom: 120,
      marginTop: 40,
    },
  })