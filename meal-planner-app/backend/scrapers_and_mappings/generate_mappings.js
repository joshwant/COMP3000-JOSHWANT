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
    confidence: Number
  });

  const ProductMapping = mainDB.model('ProductMapping', productMappingSchema);

  // Normalization function
  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/tesco|sainsbury's|asda|aldi|morrisons/gi, '')
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\b(\d+g|\d+ml|\d+l)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Fetch products
  const tescoProducts = await tescoDB.collection('products').find().limit(100).toArray();
  const sainsburysProducts = await sainsburysDB.collection('products').find().limit(100).toArray();

  console.log(`🔍 Found ${tescoProducts.length} Tesco products and ${sainsburysProducts.length} Sainsbury's products`);

  // Normalize names
  const normalizedTesco = tescoProducts.map(p => ({
    ...p,
    normalized: normalizeName(p.name)
  }));

  const normalizedSainsburys = sainsburysProducts.map(p => ({
    ...p,
    normalized: normalizeName(p.name)
  }));

  // Fuzzy matching
  const matches = [];
  for (const tescoItem of normalizedTesco) {
    const sainsburysNames = normalizedSainsburys.map(p => p.normalized);
    const similarityResult = stringSimilarity.findBestMatch(tescoItem.normalized, sainsburysNames);

    if (similarityResult.bestMatch.rating > 0.7) {
      const bestMatch = normalizedSainsburys[similarityResult.bestMatchIndex];
      matches.push({
        generic_name: tescoItem.normalized,
        tesco_name: tescoItem.name,
        sainsburys_name: bestMatch.name,
        tesco_price: tescoItem.price,
        sainsburys_price: bestMatch.price,
        confidence: similarityResult.bestMatch.rating
      });
    }
  }

  // Save to main database
  await ProductMapping.deleteMany({}); // Clear existing mappings
  await ProductMapping.insertMany(matches);
  console.log(`✅ Saved ${matches.length} fuzzy-matched products to 'main.productmappings'`);

  mongoose.connection.close();
  process.exit(0);

}).catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});