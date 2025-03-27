require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const stringSimilarity = require('string-similarity');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const productMappingSchema = new mongoose.Schema({}, { strict: false });
const ProductMapping = mongoose.model('ProductMapping', productMappingSchema);

// Normalization
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/tesco|sainsbury's|asda|aldi|morrisons|british|organic|so/gi, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract quantity from search term (e.g. "2 pints" → 1136ml)
function extractQuantity(searchTerm) {
  const quantityMap = {
    pint: 568,
    pints: 568,
    litre: 1000,
    liters: 1000,
    l: 1000,
    ml: 1,
    g: 1
  };

  const match = searchTerm.match(/(\d+)\s*(pint|pints|litre|liters|l|ml|g)/i);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  return value * (quantityMap[unit] || 1);
}

app.post('/api/match-item', async (req, res) => {
  try {
    const { itemName } = req.body;

    const allMappings = await ProductMapping.find().lean();

    const { normalized, quantity } = normalizeAndExtract(itemName);

    const matches = allMappings.map(mapping => ({
      ...mapping,
      similarity: stringSimilarity.compareTwoStrings(
        normalized,
        mapping.generic_name
      )
    }))
    .filter(m => m.similarity > 0.6) // Minimum similarity threshold
    .sort((a, b) => b.similarity - a.similarity);

    let bestMatch = null;
    if (quantity) {
      bestMatch = matches.find(m =>
        m.tesco_quantity === quantity.value ||
        m.sainsburys_quantity === quantity.value
      );
    }

    bestMatch = bestMatch || matches[0];

    if (bestMatch?.similarity > 0.7) {
      return res.json({
        success: true,
        matches: {
          tesco: {
            price: bestMatch.tesco_price,
            name: bestMatch.tesco_name,
            quantity: bestMatch.tesco_quantity
          },
          sainsburys: {
            price: bestMatch.sainsburys_price,
            name: bestMatch.sainsburys_name,
            quantity: bestMatch.sainsburys_quantity
          }
        },
        confidence: bestMatch.similarity
      });
    }

    res.json({ success: false, message: 'No close matches found' });

  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function normalizeAndExtract(name) {
  const quantity = extractQuantity(name);

  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\b(organic|free range|original|classic|ready to eat)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { normalized, quantity };
}

function extractQuantity(name) {
  const quantityRegex = /(\d+)\s*(g|kg|ml|l|pints?|litres?)\b/i;
  const match = name.match(quantityRegex);
  if (!match) return null;

  let value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  // Convert all units to grams or milliliters for comparison
  if (unit === 'kg') {
    value *= 1000;
  } else if (unit === 'l' || unit === 'litres') {
    value *= 1000;
  } else if (unit === 'pint' || unit === 'pints') {
    value *= 568; // 1 pint ≈ 568ml
  }

  return {
    value,
    originalUnit: unit,
    standardUnit: unit === 'kg' ? 'g' : 'ml'
  };
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));