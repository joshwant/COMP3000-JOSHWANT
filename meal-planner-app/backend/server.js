require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const stringSimilarity = require('string-similarity');
const { Mistral } = require('@mistralai/mistralai');

const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,POST',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

const mainConnection = mongoose.createConnection(process.env.MONGODB_URI_MAIN, { useNewUrlParser: true});
const tescoConnection = mongoose.createConnection(process.env.MONGODB_URI_TESCO, { useNewUrlParser: true});
const sainsburysConnection = mongoose.createConnection(process.env.MONGODB_URI_SAINSBURYS, { useNewUrlParser: true});

const ProductMapping = mainConnection.model('ProductMapping', new mongoose.Schema({}, { strict: false }), 'productmappings');
const TescoProduct = tescoConnection.model('TescoProduct', new mongoose.Schema({}, { strict: false }), 'products');
const SainsburysProduct = sainsburysConnection.model('SainsburysProduct', new mongoose.Schema({}, { strict: false }), 'products');

//Manual mappings connection
const manualMappingsConnection = mongoose.createConnection(process.env.MONGODB_URI_MANUAL_MAPPINGS, { useNewUrlParser: true });
const ManualMapping = manualMappingsConnection.model('ManualMapping', new mongoose.Schema({}, { strict: false }), 'manualProductMappings');


let productCache = [];
const refreshCache = async () => {
  productCache = await ProductMapping.find().lean();
  console.log(`Cache updated: ${productCache.length} products`);
};
refreshCache();
setInterval(refreshCache, 6000000); // Refresh every 100 minutes

// Normalize
const normalizeName = (name) => name.toLowerCase()
  .replace(/[^a-z0-9\s%]/g, '')
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

  const tokenOverlapCount = queryTokens.filter(token =>
    productTokens.some(pt => pt.includes(token) || token.includes(pt))
  ).length;
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

// Get tesco and sainsburys imageurl and price per unit from database
const fetchAdditionalProductDetails = async (selectedCandidate) => {
  try {
    console.log('Looking for Tesco:', selectedCandidate.tesco_name);
    console.log('Looking for Sainsburys:', selectedCandidate.sainsburys_name);

    const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Fetch product details from both tesco and sainsburys databases
    const [tescoProduct, sainsburysProduct] = await Promise.all([
      TescoProduct.findOne({ name: new RegExp(escapeRegex(selectedCandidate.tesco_name), 'i') }).lean(),
      SainsburysProduct.findOne({ name: new RegExp(escapeRegex(selectedCandidate.sainsburys_name), 'i') }).lean()
    ]);

    console.log('Tesco DB Match:', tescoProduct ? tescoProduct.name : 'undefined');
    console.log('Sainsbury\'s DB Match:', sainsburysProduct ? sainsburysProduct.name : 'undefined');

    return {
      tescoImageUrl: tescoProduct?.imageUrl || null,
      sainsburysImageUrl: sainsburysProduct?.imageUrl || null,
      tescoPricePerUnit: tescoProduct?.pricePerUnit || null,
      sainsburysPricePerUnit: sainsburysProduct?.pricePerUnit || null
    };
  } catch (error) {
    console.error('Error fetching additional product details:', error);
    return {
      tescoImageUrl: null,
      sainsburysImageUrl: null,
      tescoPricePerUnit: null,
      sainsburysPricePerUnit: null
    };
  }
};

// Utility to escape regex special characters in names
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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

    const manualMapping = await ManualMapping.findOne({ 'queries': { $in: [normalized] } }).lean();

    if (manualMapping) {
      console.log('Manual mapping found for:', itemName, manualMapping);

      const selected = {
        generic_name: manualMapping.generic_name,

        // Tesco fields
        tesco_name: manualMapping.tesco.name,
        tesco_price: manualMapping.tesco.price,
        tesco_quantity: manualMapping.tesco.quantity || 1,
        tescoImageUrl: manualMapping.tesco.imageUrl,
        tescoPricePerUnit: manualMapping.tesco.pricePerUnit,

        // Sainsbury’s fields
        sainsburys_name: manualMapping.sainsburys.name,
        sainsburys_price: manualMapping.sainsburys.price,
        sainsburys_quantity: manualMapping.sainsburys.quantity || 1,
        sainsburysImageUrl: manualMapping.sainsburys.imageUrl,
        sainsburysPricePerUnit: manualMapping.sainsburys.pricePerUnit,
      };

      return res.json({
        success: true,
        selected_candidate: {
          selected_candidate: selected,
          confidence: manualMapping.confidence || 1.0,
          message: manualMapping.message || "Manual mapping"
        },
        confidence: manualMapping.confidence || 1.0
      });
    }

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

    // Sort candidates by score in descending order and take the top 5
    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.slice(0, 5); // Get top 5 matches

    if (topCandidates.length === 0 || topCandidates[0].score < 0.3) {
      // Fallback: Search in Tesco and Sainsburys collections individually using the original itemName
      const fallbackRegex = new RegExp(escapeRegex(itemName), 'i');

      const [tescoProduct, sainsburysProduct] = await Promise.all([
        TescoProduct.findOne({ name: fallbackRegex }).lean(),
        SainsburysProduct.findOne({ name: fallbackRegex }).lean()
      ]);

      // If at least one product is found, build a fallback candidate object
      if (tescoProduct || sainsburysProduct) {
        const fallbackCandidate = {
          generic_name: (tescoProduct && tescoProduct.generic_name) ||
                          (sainsburysProduct && sainsburysProduct.generic_name) ||
                          itemName,
          tesco_name: tescoProduct ? tescoProduct.name : null,
          sainsburys_name: sainsburysProduct ? sainsburysProduct.name : null,
          tesco_price: tescoProduct ? tescoProduct.price : null,
          sainsburys_price: sainsburysProduct ? sainsburysProduct.price : null,
          tesco_quantity: tescoProduct ? tescoProduct.quantity : null,
          sainsburys_quantity: sainsburysProduct ? sainsburysProduct.quantity : null,
          tescoImageUrl: tescoProduct ? tescoProduct.imageUrl : null,
          sainsburysImageUrl: sainsburysProduct ? sainsburysProduct.imageUrl : null,
          // play around with this score
          confidence: 0.5,
          message: "Fallback match using individual store search"
        };

        return res.json({
          success: true,
          selected_candidate: { selected_candidate: fallbackCandidate, confidence: 0.5 },
          confidence: 0.5
        });
      } else {
        // If no fallback match is found, return a no-match response
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
    }

    // Get Mistral API response
    const mistralResponse = await getMistralResponse(itemName, topCandidates);

    if (mistralResponse.selected_candidate) {
      // Fetch additional product details from both Tesco and Sainsburys
      const additionalDetails = await fetchAdditionalProductDetails(mistralResponse.selected_candidate);

      // Merge additional details into the selected candidate
      const enhancedResponse = {
        ...mistralResponse,
        selected_candidate: {
          ...mistralResponse.selected_candidate,
          ...additionalDetails
        }
      };

      return res.json({
        success: true,
        selected_candidate: enhancedResponse,
        confidence: 0.95
      });
    }

    // If no selected candidate then return the original mistral response
    return res.json({
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
const HOST = '0.0.0.0'; // This allows the server to accept requests from any IP on my local network
app.listen(PORT, HOST, () => console.log(`Server running on http://0.0.0.0:${PORT}`));

app.get('/test', (req, res) => {
  res.send('Server is working!');
});

app.get('/api/search-products', async (req, res) => {
  try {
    const { store, q } = req.query;
    if (!store || !q) {
      return res.status(400).json({ error: 'Missing store or query parameter' });
    }
    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(escapeRegex(q), 'i');

    let collectionToSearch;
    if (store.toLowerCase() === 'tesco') {
      collectionToSearch = TescoProduct;
    } else if (store.toLowerCase() === 'sainsburys') {
      collectionToSearch = SainsburysProduct;
    } else {
      return res.status(400).json({ error: 'Invalid store specified' });
    }

    const products = await collectionToSearch.find({ name: regex }).lean();
    return res.json({ products });
  } catch (error) {
    console.error('Error searching products:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});


//ADMIN BACKEND dont add to frontend
app.post('/api/admin/test-create', async (req, res) => {
  try {
    //dummy entry
    const dummyEntry = new ManualMapping({
      testField: 'Hello from the new database!',
      createdAt: new Date()
    });

    await dummyEntry.save();

    res.status(201).json({ success: true, message: 'Dummy entry created in new database.' });
  } catch (error) {
    console.error('Error creating dummy entry:', error);
    res.status(500).json({ success: false, error: 'Failed to create dummy entry' });
  }
});

// Create a new manual mapping
app.post('/api/admin/manual-mappings', async (req, res) => {
  try {
    const newMapping = new ManualMapping(req.body);
    await newMapping.save();
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error saving manual mapping:', err);
    res.status(500).json({ error: "Failed to save mapping" });
  }
});

// Get all manual mappings
app.get('/api/admin/manual-mappings', async (req, res) => {
  try {
    const mappings = await ManualMapping.find({}).lean();
    return res.status(200).json(mappings);
  } catch (err) {
    console.error('Error fetching manual mappings:', err);
    res.status(500).json({ error: "Failed to fetch mappings" });
  }
});

// Search Tesco or Sainsburys products
app.get('/api/admin/products/search', async (req, res) => {
  try {
    const { store, q } = req.query;
    if (!store || !q) {
      return res.status(400).json({ error: 'Missing store or query parameter' });
    }

    let collectionToSearch;
    let sainsburysResults = [];
    if (store.toLowerCase() === 'tesco') {
      collectionToSearch = TescoProduct;
    } else if (store.toLowerCase() === 'sainsburys') {
      collectionToSearch = SainsburysProduct;
    } else {
      return res.status(400).json({ error: 'Invalid store specified' });
    }

    const regex = new RegExp(q, 'i');
    const results = await collectionToSearch.find({ name: regex }).limit(50).lean();

    console.log('Results found: ', results);

    return res.status(200).json(results);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: "Failed to search products" });
  }
});