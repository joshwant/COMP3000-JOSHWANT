require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define the schema once when server starts
const productMappingSchema = new mongoose.Schema({}, { strict: false });
const ProductMapping = mongoose.model('ProductMapping', productMappingSchema);

app.post('/api/match-item', async (req, res) => {
  try {
    const { itemName } = req.body;

    // Normalize input
    const normalized = normalizeName(itemName);

    const match = await ProductMapping.findOne({
      generic_name: normalized,
      confidence: { $gte: 0.7 }
    }).lean(); // .lean() returns plain JS objects

    if (match) {
      return res.json({
        success: true,
        matches: {
          tesco: {
            price: match.tesco_price,
            name: match.tesco_name
          },
          sainsburys: {
            price: match.sainsburys_price,
            name: match.sainsburys_name
          }
        }
      });
    }

    res.json({
      success: false,
      message: 'No pre-matched items found'
    });

  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/tesco|sainsbury's|asda|aldi|morrisons/gi, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));