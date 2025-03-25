require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

(async () => {
  console.log("🚀 Starting Tesco duplicate count script...");

  const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB_TESCO}?retryWrites=true&w=majority`;

  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err);
      process.exit(1);
    });

  const productSchema = new mongoose.Schema({
    supermarket: String,
    name: String,
    price: String,
    pricePerUnit: String,
    imageUrl: String,
    category: String,
  });

  const Product = mongoose.model('Product', productSchema);

  try {
    console.log("🔎 Finding duplicate products...");

    // Find duplicate products based on name
    const duplicates = await Product.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          categories: { $addToSet: "$category" }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`⚠️ Found ${duplicates.length} duplicate product groups.`);
    console.log("Duplicate items:");

    duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. ${dup._id} - ${dup.count} copies in categories: ${dup.categories.join(", ")}`);
    });

  } catch (error) {
    console.error("❌ Error processing duplicates:", error);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed.");
  }
})();
