require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const stringSimilarity = require('string-similarity');
const { Mistral } = require('@mistralai/mistralai');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const ProductMapping = mongoose.model('ProductMapping', new mongoose.Schema({}, { strict: false }));

let productCache = [];
const refreshCache = async () => {
  productCache = await ProductMapping.find().lean();
  console.log(`🔄 Cache updated: ${productCache.length} products`);
};
refreshCache();
setInterval(refreshCache, 6000000); // Refresh every 100 minutes

// Normalize
const normalizeName = (name) => name.toLowerCase()
  .replace(/[^a-z0-9\s]/g, '')
  .replace(/\b(favorite|favourite|tesco|sainsbury's|british|organic)\b/gi, '')
  .replace(/\s+/g, ' ')
  .trim();

// Extract quantity from string
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

// Scoring function
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

// Mistral API
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const getMistralResponse = async (itemName, candidates) => {
  try {
    console.log('Sending candidates to Mistral:', itemName, candidates);

    // Validate the candidate data
    const formattedCandidates = candidates.map((candidate, index) => {
      if (
        !candidate.tesco_name || !candidate.sainsburys_name ||
        !candidate.tesco_price || !candidate.sainsburys_price ||
        !candidate.tesco_quantity || !candidate.sainsburys_quantity
      ) {
        console.error(`Candidate ${index + 1} is missing required data`, candidate);
        return null;
      }

      return {
        id: `candidate${index + 1}`,
        generic_name: candidate.generic_name,
        tesco_name: candidate.tesco_name,
        sainsburys_name: candidate.sainsburys_name,
        tesco_price: candidate.tesco_price,
        sainsburys_price: candidate.sainsburys_price,
        tesco_quantity: candidate.tesco_quantity,
        sainsburys_quantity: candidate.sainsburys_quantity
      };
    });

    if (formattedCandidates.length === 0) {
      throw new Error('No valid candidates available to send to Mistral');
    }

    // Send candidates to Mistral for final selection
    const chatResponse = await client.agents.complete({
      agentId: "ag:b6930449:20250327:agent1:b03d9211",
      messages: [{
        role: 'user',
        content: JSON.stringify({
          query: itemName,
          candidates: formattedCandidates
        })
      }],
    });

    console.log('Mistral Response:', chatResponse);
    let parsedContent;
    try {
      parsedContent = JSON.parse(chatResponse.choices[0].message.content);
    } catch (err) {
      console.error("Failed to parse Mistral response:", chatResponse.choices[0].message.content);
      throw new Error("Mistral response was not valid JSON");
    }
    return parsedContent;
  } catch (error) {
    console.error('Error from Mistral API:', error.response ? error.response.data : error.message);
    throw new Error('Mistral API request failed');
  }
};

app.post('/api/match-item', async (req, res) => {
  try {
    const { itemName } = req.body;
    const { normalized, quantity } = normalizeAndExtract(itemName);

    // Check if productCache is properly populated
    if (!productCache || productCache.length === 0) {
      console.error('No products found in productCache');
      return res.status(500).json({ error: 'Product cache is empty or undefined' });
    }

    // Map over the productCache and calculate scores
    let candidates = productCache.map((product, index) => {
      const score = calculateScore(normalized, product, quantity);
      return { ...product, score, id: `candidate${index + 1}` };
    });

    // Sort candidates by score in descending order and take the top 4
    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.slice(0, 4); // Get top 4 matches

    if (topCandidates.length === 0 || topCandidates[0].score < 0.3) {
      return res.json({
        success: true,
        selected_candidate: {
          selected_candidate: null,
          confidence: 0,
          message: "No good match found"
        },
        confidence: 0.95
      });
    }

    // Get Mistral API response
    const mistralResponse = await getMistralResponse(itemName, topCandidates);

    // Respond with the top 4 candidates and the Mistral response
    res.json({
      success: true,
      selected_candidate: mistralResponse,
      confidence: 0.95
    });

  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));