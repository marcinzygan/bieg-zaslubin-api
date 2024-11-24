const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Runner = require("../models/runnersModel");

// Load environment variables from .env.local
dotenv.config({ path: "../.env.local" });

const DATABASE_STRING = process.env.DATABASE_STRING.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
// Function to scrape registered runners
async function scrape() {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("Starting the scraping process...");

    // Navigate to the target page
    await page.goto(
      "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_kolobrzeska_15stka_zaslubin/9626"
    );
    await page.waitForSelector("#participants_info"); // Wait for the element

    // Scrape the registered runners count
    const registeredRunners = await page.$eval("#participants_info", (el) =>
      el.textContent.trim()
    );
    console.log(registeredRunners);
    const match = registeredRunners.match(/of (\d+) entries/i);
    const totalEntries = parseInt(match[1], 10);
    const registeredRunnersCount = parseInt(totalEntries, 10);

    console.log(`Scraped registered runners count: ${registeredRunnersCount}`);

    // Save to MongoDB
    await saveToDatabase(registeredRunnersCount);
    console.log("Data successfully saved to the database.");
  } catch (error) {
    console.error("Error occurred during scraping:", error);
  } finally {
    // Do not close the database connection here.
    await browser.close();
  }
}
// Function to save data to MongoDB
async function saveToDatabase(registeredRunnersCount) {
  try {
    console.log("Starting database update...");
    const updatedRunner = await Runner.findOneAndUpdate(
      { _id: "6742ea08f778c6c2685744b9" },
      { registered: registeredRunnersCount, lastUpdated: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    console.log("Database updated:", updatedRunner);
  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
  }
}
// Main function to connect to MongoDB and start the scraper
async function scrapeRegisteredRunners() {
  try {
    console.log("Connecting to the database...");
    await mongoose.connect(DATABASE_STRING);
    console.log("Database connection successful!");

    // Start the scraping process
    await scrape();
  } catch (error) {
    console.error("Error in the main process:", error);
  }
}

module.exports = scrapeRegisteredRunners;
