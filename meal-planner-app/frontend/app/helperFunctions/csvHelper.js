import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import Papa from 'papaparse';

export const loadCsvData = async () => {
  try {
    let csvString = '';

    if (Platform.OS === 'web') {
      // On Web: Fetch CSV from `public/` folder
      const response = await fetch('/csvFiles/tesco_data_fresh-food.csv');
      csvString = await response.text();
    } else {
      // On Mobile: Use Asset to load CSV file bundled in the app
      const asset = Asset.fromModule(require('../assets/tesco_data_fresh-food.csv'));
      await asset.downloadAsync(); // Ensure asset is available locally

      if (!asset.localUri) {
        throw new Error('Failed to get the local URI for the CSV file.');
      }

      // Read the CSV file from the local URI
      csvString = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    // Parse the CSV data using PapaParse
    const results = Papa.parse(csvString, { header: true });

    console.log('✅ Parsed CSV Data');
    return results.data;
  } catch (error) {
    console.error('❌ Error loading CSV:', error);
    return [];
  }
};

export default { loadCsvData };
