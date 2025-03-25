require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const stringSimilarity = require('string-similarity');

// MongoDB connection
const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}/?${process.env.MONGO_OPTIONS}`;

mongoose.connect(mongoURI).then(async () => {
  console.log("✅ Connected to MongoDB");

  // Database references
  const tescoDB = mongoose.connection.useDb('tesco');
  const sainsburysDB = mongoose.connection.useDb('sainsburys');
  const mainDB = mongoose.connection.useDb('main');

  // Schema for product mappings
  const productMappingSchema = new mongoose.Schema({
    generic_name: String,
    tesco_name: String,
    sainsburys_name: String,
    tesco_price: String,
    sainsburys_price: String,
    tesco_quantity: Number,
    sainsburys_quantity: Number,
    tesco_fat_percentage: Number,
    sainsburys_fat_percentage: Number,
    confidence: Number
  });

  const ProductMapping = mainDB.model('ProductMapping', productMappingSchema);

  // Extract quantity from product name (e.g. "250g" → 250)
  const extractQuantity = (name) => {
    const matches = name.match(/(\d+)\s*(g|kg|ml|l|pints?)/i);
    if (!matches) return null;

    let value = parseInt(matches[1]);
    let unit = matches[2].toLowerCase();

    // Convert kg to grams + litres to ml for easier comparison
    if (unit === 'kg') {
      value *= 1000;
      unit = 'g';
    } else if (unit === 'l' || unit === 'pints') {
      value *= unit === 'pints' ? 568 : 1000; // 1 pint ≈ 568ml
      unit = 'ml';
    }

    return { value, unit};
  };

  // Extract fat percentage from product name (e.g. "20% Fat" → "20")
  const extractFatPercentage = (name) => {
    const match = name.match(/(\d+)%\s*fat/i);
    return match ? parseInt(match[1]) : null;
  };

  // Normalization function to remove brands, modifiers, and packaging terms
  const normalizeName = (name) => {
    return name
      .toLowerCase()
      // Remove brands and proprietary terms
      .replace(/tesco|sainsbury's|finest|taste the difference|so organic|msc|asc|stamford street co\./gi, '')
      // Remove preparation styles and packaging terms
      .replace(/\b(pack|jar|rashers|fillets|boil in the bag|ready to eat|skin on|boneless|smoked|style)\b/gi, '')
      // Handle synonyms
      .replace(/\b(flavoured|flavor)\b/gi, 'flavour')
      .replace(/\b(with|&)\b/gi, '')
      // Remove quantity mentions (handled separately)
      .replace(/(\d+)\s*(g|kg|ml|l|pints?)\b/gi, '')
      // Remove special characters
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Compare quantities with tolerance (10% has been working fine for me so far)
  const areQuantitiesSimilar = (qty1, qty2, maxDifference = 0.1) => {
    if (!qty1 || !qty2) return true; // Allow matches if either has no quantity
    if (qty1.unit !== qty2.unit) return false;

    const difference = Math.abs(qty1.value - qty2.value) / Math.max(qty1.value, qty2.value);
    return difference <= maxDifference;
  };

  // Compare fat percentages with tolerance (default 5%)
  const areFatPercentagesSimilar = (fat1, fat2, maxDifference = 0.05) => {
    if (fat1 === null || fat2 === null) return true; // Allow matches if either has no fat percentage
    const difference = Math.abs(fat1 - fat2) / Math.max(fat1, fat2);
    return difference <= maxDifference;
  };

  // Fetch products (testing with 2000 items) .find().limit(2000)
  const tescoProducts = await tescoDB.collection('products').find().toArray();
  const sainsburysProducts = await sainsburysDB.collection('products').find().toArray();

  console.log(`🔍 Found ${tescoProducts.length} Tesco products and ${sainsburysProducts.length} Sainsbury's products`);

  // Preprocess products with quantities + fat %
  const processedTesco = tescoProducts.map(p => ({
    ...p,
    normalized: normalizeName(p.name),
    quantity: extractQuantity(p.name),
    fat_percentage: extractFatPercentage(p.name)
  }));

  const processedSainsburys = sainsburysProducts.map(p => ({
    ...p,
    normalized: normalizeName(p.name),
    quantity: extractQuantity(p.name),
    fat_percentage: extractFatPercentage(p.name)
  }));

  // Fuzzy matching with quantity + fat % checks
  const matches = [];
  for (const tescoItem of processedTesco) {
    const sainsburysNames = processedSainsburys.map(p => p.normalized);
    const similarityResult = stringSimilarity.findBestMatch(tescoItem.normalized, sainsburysNames);

    if (similarityResult.bestMatch.rating > 0.7) {
      const bestMatch = processedSainsburys[similarityResult.bestMatchIndex];

      // Quantity similarity check
      if (areQuantitiesSimilar(tescoItem.quantity, bestMatch.quantity) && areFatPercentagesSimilar(tescoItem.fat_percentage, bestMatch.fat_percent)) {
        matches.push({
          generic_name: tescoItem.normalized,
          tesco_name: tescoItem.name,
          sainsburys_name: bestMatch.name,
          tesco_price: tescoItem.price,
          sainsburys_price: bestMatch.price,
          tesco_quantity: tescoItem.quantity?.value || null,
          sainsburys_quantity: bestMatch.quantity?.value || null,
          tesco_fat_percentage: tescoItem.fat_percentage,
          confidence: similarityResult.bestMatch.rating
        });
      }
    }
  }

  // Get 10 random unmatched Tesco and Sainsbury's products for analysis
  const getRandomUnmatchedItems = (allItems, matchedNames, sampleSize = 10) => {
    const unmatched = allItems.filter(item => !matchedNames.includes(item.name));
    return unmatched.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
  };

  // Get matched product names
  const matchedTescoNames = matches.map(m => m.tesco_name);
  const matchedSainsburysNames = matches.map(m => m.sainsburys_name);

  // Get random samples
  const unmatchedTescoSample = getRandomUnmatchedItems(processedTesco, matchedTescoNames);
  const unmatchedSainsburysSample = getRandomUnmatchedItems(processedSainsburys, matchedSainsburysNames);

  // Log results with formatting
  console.log('\n=== UNMATCHED ITEM ANALYSIS ===');
  console.log('\n💔 Example Tesco Items Needing Matching:');
  unmatchedTescoSample.forEach((item, i) => {
    console.log(`${i + 1}. ${item.name}
     - Quantity: ${item.quantity?.value || 'N/A'}${item.quantity?.unit || ''}
     - Fat%: ${item.fat_percentage || 'N/A'}
     - Normalized: "${item.normalized}"`);
  });

  console.log('\n💔 Example Sainsbury\'s Items Needing Matching:');
  unmatchedSainsburysSample.forEach((item, i) => {
    console.log(`${i + 1}. ${item.name}
     - Quantity: ${item.quantity?.value || 'N/A'}${item.quantity?.unit || ''}
     - Fat%: ${item.fat_percentage || 'N/A'}
     - Normalized: "${item.normalized}"`);
  });
  //end of random unmatched items

  // Save to main database
  await ProductMapping.deleteMany({});
  await ProductMapping.insertMany(matches);
  console.log(`✅ Saved ${matches.length} filtered matches to 'main.productmappings'`);

  mongoose.connection.close();
  process.exit(0);

}).catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});