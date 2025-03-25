require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

(async () => {
  console.log("🚀 Starting Tesco duplicate removal script...");

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

    // Find duplicates based on name
    const duplicates = await Product.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`⚠️ Found ${duplicates.length} duplicate product groups.`);

    let totalDeleted = 0;

    for (const dup of duplicates) {
      const idsToDelete = dup.ids.slice(1); // Keep the first item, delete the rest

      const deleteResult = await Product.deleteMany({ _id: { $in: idsToDelete } });
      totalDeleted += deleteResult.deletedCount;

      console.log(`Deleted ${deleteResult.deletedCount} duplicate(s) for "${dup._id}"`);
    }

    console.log(`✅ Total duplicates removed: ${totalDeleted}`);

  } catch (error) {
    console.error("❌ Error removing duplicates:", error);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed.");
  }
})();
