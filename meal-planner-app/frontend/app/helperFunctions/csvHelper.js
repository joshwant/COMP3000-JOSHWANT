import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

export const loadCsvData = async () => {
  try {
    let csvString = '';

    if (Platform.OS === 'web') {
      //On Web: Fetch CSV from `public/` folder
      const response = await fetch('/csvFiles/tesco_data_fresh-food.csv');
      csvString = await response.text();
    } else {
      //On Mobile: Use FileSystem to read from bundle
      const fileUri = FileSystem.bundleDirectory + 'assets/tesco_data_fresh-food.csv';

      if (!fileUri) {
        throw new Error('Failed to get the file URI');
      }

      csvString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
    }

    //Parse the CSV data using 'PapaParse'
    const results = Papa.parse(csvString, { header: true });

    console.log('✅ Parsed CSV Data:', results.data);
    return results.data;
  } catch (error) {
    console.error('❌ Error loading CSV:', error);
    return [];
  }
};

export default { loadCsvData };
