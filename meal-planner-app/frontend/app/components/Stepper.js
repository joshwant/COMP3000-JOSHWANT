import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Stepper = ({ value, onChange, min = 1, max = 10 }) => {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity style={styles.stepperButton} onPress={decrement}>
        <Text style={styles.stepperButtonText}>–</Text>
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity style={styles.stepperButton} onPress={increment}>
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 120,
    padding: 8,
  },
  stepperButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepperValue: {
    fontSize: 16,
    marginHorizontal: 12,
  },
});

export default Stepper;
