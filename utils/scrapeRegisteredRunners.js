const chrome = require("@sparticuz/chromium");
const puppeteerCore = require("puppeteer-core");
const puppeteer = require("puppeteer");
const Runner = require("../models/runnersModel");
const dotenv = require("dotenv");
// Load environment variables from .env.local
dotenv.config({ path: "../.env.local" });

async function scrape() {
  let browser;

  try {
    if (process.env.NODE_ENV === "development") {
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      });
    }
    if (process.env.NODE_ENV === "production") {
      browser = await puppeteerCore.launch({
        args: chrome.args,
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath(),
        headless: chrome.headless,
        ignoreHTTPSErrors: true, // Ignore SSL errors for faster loading
        defaultViewport: { width: 1280, height: 800 }, // Specify a fixed viewport
      });
    }

    const page = await browser.newPage();
    console.log("Starting the scraping process...");

    await page.goto(
      "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_21032026__kolobrzeska_15stka_zaslubin/11575",
      { timeout: 60000 } // 30 seconds timeout to avoid hanging
    );

    await page.waitForSelector("#participants_info");
    const registeredRunners = await page.$eval("#participants_info", (el) =>
      el.textContent.trim()
    );
    console.log(registeredRunners);

    // Match the total registered runners using a regular expression
    // const match = registeredRunners.match(/of\s+(\d+)\s+entries/);
    const match = registeredRunners.match(/of\s+(\d+)\s+entries/);
    if (!match) {
      throw new Error("Unable to extract total entries.");
    }
    const totalEntries = parseInt(match[1], 10);
    console.log(`Scraped registered runners count: ${totalEntries}`);
    console.log(`Scraped data: ${registeredRunners}`);
    console.log(`Scraped registered runners count: ${totalEntries}`);

    // Save to MongoDB
    await saveToDatabase(totalEntries);
    console.log("Data successfully saved to the database.");
  } catch (error) {
    console.error("Error occurred during scraping:", error);
  } finally {
    if (browser) {
      await browser.close(); // Ensure browser is closed after the scrape
    }
  }
}

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

async function scrapeRegisteredRunners() {
  try {
    await scrape();
    console.log("Scraping successful!");
  } catch (error) {
    console.error("Error in the main process:", error);
  }
}

module.exports = scrapeRegisteredRunners;
// const puppeteerCore = require("puppeteer-core");
// const chromium = require("@sparticuz/chromium");
// const Runner = require("../models/runnersModel");
// const mongoose = require("mongoose");

// async function scrapeRegisteredRunners() {
//   let browser;

//   try {
//     // Launch browser in serverless-friendly way
//     browser = await puppeteerCore.launch({
//       args: chromium.args,
//       defaultViewport: chromium.defaultViewport,
//       executablePath: await chromium.executablePath(),
//       headless: chromium.headless,
//       ignoreHTTPSErrors: true,
//     });

//     const page = await browser.newPage();
//     console.log("Starting scraping...");

//     await page.goto(
//       "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_21032026__kolobrzeska_15stka_zaslubin/11575",
//       { timeout: 60000 }
//     );

//     await page.waitForSelector("#participants_info");

//     const registeredRunners = await page.$eval("#participants_info", (el) =>
//       el.textContent.trim()
//     );
//     console.log("RAW TEXT:", registeredRunners);
//     const match = registeredRunners.match(/z\s+(\d+)\s+łącznie/);
//     if (!match) {
//       throw new Error("Unable to extract total entries.");
//     }

//     const totalEntries = parseInt(match[1], 10);
//     console.log(`Scraped registered runners count: ${totalEntries}`);
//     // Save to MongoDB
//     await saveToDatabase(totalEntries);

//     console.log("Scraping finished successfully!");
//     return totalEntries;
//   } catch (err) {
//     console.error("Error during scraping:", err);
//     throw err;
//   } finally {
//     if (browser) await browser.close();
//   }
// }

// async function saveToDatabase(registeredRunnersCount) {
//   if (!mongoose.connection.readyState) {
//     // Connect if not already connected
//     const DB = process.env.DATABASE_STRING.replace(
//       "<PASSWORD>",
//       process.env.DATABASE_PASSWORD
//     );

//     await mongoose.connect(DB, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000,
//     });

//     console.log("✅ Connected to MongoDB");
//   }

//   try {
//     const updatedRunner = await Runner.findOneAndUpdate(
//       { _id: "6742ea08f778c6c2685744b9" },
//       { registered: registeredRunnersCount, lastUpdated: new Date() },
//       { new: true, upsert: true, runValidators: true }
//     );

//     console.log("Database updated:", updatedRunner);
//   } catch (err) {
//     console.error("Error saving data to MongoDB:", err);
//     throw err;
//   }
// }

// module.exports = scrapeRegisteredRunners;
