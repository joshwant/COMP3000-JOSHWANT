require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

(async () => {
  console.log("🚀 Starting duplicate count script...");

  const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB_SAINSBURYS}?retryWrites=true&w=majority`;

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
    console.log("🔎 Counting duplicate products...");

    // Find duplicate product names within the same category
    const duplicates = await Product.aggregate([
      {
        $group: {
          _id: { name: "$name", category: "$category" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`⚠️ Found ${duplicates.length} duplicate product groups.`);
    console.log("Duplicate items:");

    duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. ${dup._id.name} (${dup._id.category}) - ${dup.count} copies`);
    });

  } catch (error) {
    console.error("❌ Error processing duplicates:", error);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed.");
  }
})();