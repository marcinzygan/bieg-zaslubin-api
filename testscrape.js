const mongoose = require("mongoose");
const scrapeRegisteredRunners = require("./utils/scrapeRegisteredRunners");
require("dotenv").config({ path: "./.env.local" });

async function testScrape() {
  try {
    const DB = process.env.DATABASE_STRING.replace(
      "<PASSWORD>",
      process.env.DATABASE_PASSWORD
    );

    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 sekund
    });
    console.log("✅ DB connected");

    await scrapeRegisteredRunners();
    console.log("Scraping finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Scraping failed:", err);
    process.exit(1);
  }
}

testScrape();
