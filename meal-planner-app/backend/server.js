require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const stringSimilarity = require('string-similarity');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const ProductMapping = mongoose.model('ProductMapping', new mongoose.Schema({}, { strict: false }));

let productCache = [];
const refreshCache = async () => {
  productCache = await ProductMapping.find().lean();
  console.log(`🔄 Cache updated: ${productCache.length} products`);
};
refreshCache();
setInterval(refreshCache, 600000);

const normalizeName = (name) => name.toLowerCase()
  .replace(/[^a-z0-9\s]/g, '')
  .replace(/\b(favorite|favourite|tesco|sainsbury's|british|organic)\b/gi, '')
  .replace(/\s+/g, ' ')
  .trim();

const extractQuantity = (name) => {
  const pintMatch = name.match(/([\d.]+)\s*(pints?)\b/i);
  if (pintMatch) return { value: parseFloat(pintMatch[1]) * 568, unit: 'ml' };

  const unitMap = { l: 1000, kg: 1000, g: 1, ml: 1 };
  const match = name.match(/([\d.]+)\s*(l|kg|g|ml)\b/i);
  if (!match) return null;

  return { value: parseFloat(match[1]) * unitMap[match[2].toLowerCase()], unit: 'ml' };
};

const normalizeAndExtract = (name) => ({
  normalized: normalizeName(name.replace(/\d.*?(ml|g|kg|l|pints?)\b/gi, '')),
  quantity: extractQuantity(name)
});

const formatMatch = (match) => ({
  generic_name: match.generic_name,
  tesco: {
    name: match.tesco_name,
    price: match.tesco_price,
    quantity: match.tesco_quantity,
    unit: match.tesco_quantity ? 'ml' : null
  },
  sainsburys: {
    name: match.sainsburys_name,
    price: match.sainsburys_price,
    quantity: match.sainsburys_quantity,
    unit: match.sainsburys_quantity ? 'ml' : null
  },
  score: match.score.toFixed(2)
});

const calculateScore = (normalizedQuery, product, queryQuantity) => {
  const productName = normalizeName(product.generic_name);
  const queryTokens = normalizedQuery.split(' ');
  const productTokens = productName.split(' ');

  const tokenOverlapCount = queryTokens.filter(token => productTokens.includes(token)).length;
  const tokenScore = tokenOverlapCount / queryTokens.length;

  const fuzzyScore = stringSimilarity.compareTwoStrings(normalizedQuery, productName);
  let nameScore = (0.7 * tokenScore) + (0.3 * fuzzyScore);

  let candidateQuantity = extractQuantity(product.tesco_name) || product.tesco_quantity;
  let quantityScore = 1;
  if (queryQuantity && candidateQuantity) {
    const qtyDiff = Math.abs(candidateQuantity.value - queryQuantity.value);
    const tolerance = 0.2 * queryQuantity.value;
    quantityScore = qtyDiff <= tolerance ? 1 - (qtyDiff / queryQuantity.value) : 0;
  }

  return nameScore * quantityScore;
};

app.post('/api/match-item', async (req, res) => {
  try {
    const { itemName } = req.body;
    const { normalized, quantity } = normalizeAndExtract(itemName);

    let candidates = productCache.map(product => {
      const score = calculateScore(normalized, product, quantity);
      return { ...product, score };
    });

    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.slice(0, 3);

    if (topCandidates.length === 0 || topCandidates[0].score < 0.3) {
      return res.json({ success: false, message: "No confident match found" });
    }

    const mistralResponse = await axios.post(
      'https://api.mistral.ai/v1/your-endpoint',
      {
        user_query: itemName,
        candidates: topCandidates.map(formatMatch)
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(mistralResponse.data);
  } catch (error) {
    console.error('❌ Match error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));