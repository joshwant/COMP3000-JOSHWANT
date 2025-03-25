require('dotenv').config({ path: '../.env' });
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const mongoose = require('mongoose');

puppeteer.use(StealthPlugin());

(async () => {
  console.log("🚀 Starting Sainsbury's Scraper...");

  const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB_SAINSBURYS}?retryWrites=true&w=majority`;

  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

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
  await page.setExtraHTTPHeaders({ 'Referer': 'https://www.sainsburys.co.uk/' });

  // Categories and their codes
//   const categories_list = ['dietary-and-lifestyle', 'fruit-veg', 'meat-fish', 'dairy-eggs-and-chilled', 'bakery', 'frozen',
//     'food-cupboard', 'drinks', 'household', 'beauty-and-cosmetics', 'health-beauty', 'home', 'baby-toddler-products', 'pet'
//   ];
//   const categories_code = ['453878', '12518', '13343', '428866', '12320', '218831',
//     '12422', '12192', '12564', '448352', '12448', '281806', '11651', '12298'
//   ];
const categories_list = ['food-cupboard'
  ];
  const categories_code = ['12422'
  ];
  //done: meat-fish, fruit-veg, dietary-and-lifestyle, dairy-eggs-and-chilled, frozen, food-cupboard
  //todo: 'bakery', 'drinks', 'household', 'beauty-and-cosmetics', 'health-beauty', 'home', 'baby-toddler-products', 'pet'

  const maxPages = 2;  // limit to 2 pages for development

  let allProducts = [];

  for (let i = 0; i < categories_list.length; i++) {
    const category = categories_list[i];
    const categoryCode = categories_code[i];

    console.log(`🔎 Scraping category: ${category} (${categoryCode})`);
    let pageNum = 1;

    while (true) { //pageNum <= maxPages
      const url = `https://www.sainsburys.co.uk/shop/CategorySeeAllView?listId=&catalogId=10241&beginIndex=${(pageNum - 1) * 60}&pageSize=60&orderBy=FAVOURITES_FIRST&categoryId=${categoryCode}&storeId=10151&langId=44`;
      console.log(`📄 Visiting: ${url}`);

      // Increase timeout to 60 seconds
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      try {
        // Accept cookies (if present)
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
        await page.click('#onetrust-accept-btn-handler');
        console.log("✅ Accepted cookies");
      } catch (e) {
        console.log("🔹 No cookie popup found or already accepted");
      }

      try {
        // Wait for the product list to be loaded
        await page.waitForSelector('.productLister .gridItem', { timeout: 60000 });
      } catch (e) {
        console.log(`⚠️ Timeout waiting for product list on page ${pageNum}`);
        break;
      }

      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      try {
        // Wait for the product list to be loaded using a selector
        await page.waitForSelector('.productLister .gridItem', { timeout: 30000 });
      } catch (e) {
        console.log(`⚠️ Timeout waiting for product list on page ${pageNum}`);
        break;
      }

      const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.productLister .gridItem')).map(product => {
          const name = product.querySelector('h3 a')?.innerText.trim() || 'No name';
          const imageUrl = product.querySelector('img')?.src || 'No image';
          const price = product.querySelector('.pricing .pricePerUnit')?.innerText.trim() || 'No price';
          const pricePerUnit = product.querySelector('.pricing .pricePerMeasure')?.innerText.trim() || 'No price per unit';
          return { name, imageUrl, price, pricePerUnit };
        });
      });

      console.log(`✅ Found ${products.length} products on page ${pageNum}`);

      if (products.length === 0) {
        console.log(`✅ No more products on page ${pageNum}. Moving to next category.`);
        break;
      }

      for (let productData of products) {
        const productEntry = new Product({
          supermarket: "Sainsbury's",
          name: productData.name,
          price: productData.price,
          pricePerUnit: productData.pricePerUnit,
          imageUrl: productData.imageUrl,
          category: category,
        });

        await productEntry.save();
        allProducts.push(productEntry);
      }

      console.log(`✅ Page ${pageNum} scraped successfully.`);

      pageNum++;
    }
  }

  console.log("🎉 Sainsbury's data saved to MongoDB!");

  await browser.close();
  mongoose.connection.close();
})();
