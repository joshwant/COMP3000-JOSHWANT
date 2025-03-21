const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

puppeteer.use(StealthPlugin());

(async () => {
  console.log("🚀 Starting Tesco Scraper...");

  const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB_TESCO}?${process.env.MONGO_OPTIONS}`;

  // Connect to MongoDB using Mongoose
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

  // Product schema for Tesco data
  const productSchema = new mongoose.Schema({
    supermarket: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    pricePerUnit: { type: String, required: false },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
  });

  const Product = mongoose.model('Product', productSchema);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
  await page.setExtraHTTPHeaders({ 'Referer': 'https://www.tesco.com/' });

  const categories = ['frozen-food', 'bakery'];
  let allProducts = [];
  //done: frozen-food, bakery, fresh-food

  for (let category of categories) {
    console.log(`🔎 Scraping category: ${category}`);
    let pageNum = 1;

    while (true) {  // Scrape all pages. Use 'pageNum <= 3' for the first 3 pages
      const url = `https://www.tesco.com/groceries/en-GB/shop/${category}/all?page=${pageNum}`;
      console.log(`📄 Visiting: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle2' });

      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
        await page.click('#onetrust-accept-btn-handler');
        console.log("✅ Accepted cookies");
      } catch (e) {
        console.log("🔹 No cookie popup found or already accepted");
      }

      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      try {
        await page.waitForSelector('._ecrj', { timeout: 30000 });
      } catch (e) {
        console.log("⚠️ Timeout waiting for product list on page " + pageNum);
        break;
      }

      const productHandles = await page.$$('._ecrj');
      console.log(`Found ${productHandles.length} products on page ${pageNum}`);

      if (productHandles.length === 0) {
        console.log(`✅ No more products on page ${pageNum}. Moving to next category.`);
        break;
      }

      // Scrape product details
      for (let product of productHandles) {
        try {
          let name = await product.$eval('.styled__Text-sc-1i711qa-1.bsLJsh.ddsweb-link__text', el => el.innerText.trim());
          let price = await product.$eval('.text__StyledText-sc-1jpzi8m-0.gyHOWz.ddsweb-text.styled__PriceText-sc-v0qv7n-1.cXlRF', el => el.innerText.trim());
          let imageUrl = await product.$eval('img.styled__StyledImage-sc-1fweb41-1', img => img.getAttribute('src'));

          let pricePerUnit = await product.$eval('p.ddsweb-price__subtext', el => el.innerText.trim()).catch(() => null);

          // Store product data in MongoDB
          const productData = new Product({
            supermarket: 'Tesco',
            name,
            price,
            pricePerUnit,
            imageUrl,
            category,
          });

          await productData.save();  // Save to MongoDB
          allProducts.push(productData);
        } catch (err) {
          console.log("⚠️ Skipping a product due to missing data.");
        }
      }

      console.log(`✅ Page ${pageNum} scraped successfully.`);
      pageNum++;
    }
  }

  console.log(`🎉 Tesco data saved to MongoDB!`);

  // todo?: Save the data in JSON format to a file for reference
  // const jsonData = JSON.stringify(allProducts, null, 2);
  // fs.writeFileSync("tesco_data.json", jsonData);
  // console.log("🎉 Data saved in tesco_data.json");

  await browser.close();
  mongoose.connection.close();  // Close MongoDB connection
})();
