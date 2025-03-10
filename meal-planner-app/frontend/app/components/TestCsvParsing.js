import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { loadCsvData } from '../helperFunctions/csvHelper';

const TestCsvParsing = () => {
  useEffect(() => {
    const fetchCsvData = async () => {
      const data = await loadCsvData();
      console.log('Loaded Data:', data);
    };

    fetchCsvData();
  }, []);

  return (
    <View>
      <Text>Testing CSV Parsing...</Text>
    </View>
  );
};

export default TestCsvParsing;
