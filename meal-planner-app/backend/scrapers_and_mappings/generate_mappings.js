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
    confidence: Number
  });

  const ProductMapping = mainDB.model('ProductMapping', productMappingSchema);

  // Extract quantity from product name (e.g. "250g" → 250)
  const extractQuantity = (name) => {
    const matches = name.match(/(\d+)\s*(g|kg|ml|l)/i);
    if (!matches) return null;

    let value = parseInt(matches[1]);
    const unit = matches[2].toLowerCase();

    // Convert kg to grams + litres to ml for easier comparison
    if (unit === 'kg') value *= 1000;
    if (unit === 'l') value *= 1000;

    return { value, unit: unit === 'kg' ? 'g' : unit }; // Standardize units
  };

  // Normalization function with quantity handling
  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/tesco|sainsbury's|asda|aldi|morrisons|pack| x\d+/gi, '') // Remove brands & pack sizes
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/(\d+)\s*(g|kg|ml|l)/gi, '') // Remove quantities after extraction
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

  // Fetch products (testing with 1000 items)
  const tescoProducts = await tescoDB.collection('products').find().limit(1000).toArray();
  const sainsburysProducts = await sainsburysDB.collection('products').find().limit(1000).toArray();

  console.log(`🔍 Found ${tescoProducts.length} Tesco products and ${sainsburysProducts.length} Sainsbury's products`);

  // Preprocess products with quantities
  const processedTesco = tescoProducts.map(p => ({
    ...p,
    normalized: normalizeName(p.name),
    quantity: extractQuantity(p.name)
  }));

  const processedSainsburys = sainsburysProducts.map(p => ({
    ...p,
    normalized: normalizeName(p.name),
    quantity: extractQuantity(p.name)
  }));

  // Fuzzy matching with quantity checks
  const matches = [];
  for (const tescoItem of processedTesco) {
    const sainsburysNames = processedSainsburys.map(p => p.normalized);
    const similarityResult = stringSimilarity.findBestMatch(tescoItem.normalized, sainsburysNames);

    if (similarityResult.bestMatch.rating > 0.7) {
      const bestMatch = processedSainsburys[similarityResult.bestMatchIndex];

      // Quantity similarity check
      if (areQuantitiesSimilar(tescoItem.quantity, bestMatch.quantity)) {
        matches.push({
          generic_name: tescoItem.normalized,
          tesco_name: tescoItem.name,
          sainsburys_name: bestMatch.name,
          tesco_price: tescoItem.price,
          sainsburys_price: bestMatch.price,
          tesco_quantity: tescoItem.quantity?.value || null,
          sainsburys_quantity: bestMatch.quantity?.value || null,
          confidence: similarityResult.bestMatch.rating
        });
      }
    }
  }

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