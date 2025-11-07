// const chrome = require("@sparticuz/chromium");
// const puppeteerCore = require("puppeteer-core");
// const puppeteer = require("puppeteer");
// const Runner = require("../models/runnersModel");
// const dotenv = require("dotenv");
// // Load environment variables from .env.local
// dotenv.config({ path: "../.env.local" });

// async function scrape() {
//   let browser;

//   try {
//     if (process.env.NODE_ENV === "development") {
//       browser = await puppeteer.launch({
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//         headless: true,
//       });
//     }
//     if (process.env.NODE_ENV === "production") {
//       browser = await puppeteerCore.launch({
//         args: chrome.args,
//         defaultViewport: chrome.defaultViewport,
//         executablePath: await chrome.executablePath(),
//         headless: chrome.headless,
//         ignoreHTTPSErrors: true, // Ignore SSL errors for faster loading
//         defaultViewport: { width: 1280, height: 800 }, // Specify a fixed viewport
//       });
//     }

//     const page = await browser.newPage();
//     console.log("Starting the scraping process...");

//     await page.goto(
//       "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_21032026__kolobrzeska_15stka_zaslubin/11575",
//       { timeout: 60000 } // 30 seconds timeout to avoid hanging
//     );

//     await page.waitForSelector("#participants_info");
//     const registeredRunners = await page.$eval("#participants_info", (el) =>
//       el.textContent.trim()
//     );
//     console.log(registeredRunners);

//     // Match the total registered runners using a regular expression
//     // const match = registeredRunners.match(/of\s+(\d+)\s+entries/);
//     const match = registeredRunners.match(/of\s+(\d+)\s+entries/);
//     if (!match) {
//       throw new Error("Unable to extract total entries.");
//     }
//     const totalEntries = parseInt(match[1], 10);
//     console.log(`Scraped registered runners count: ${totalEntries}`);
//     console.log(`Scraped data: ${registeredRunners}`);
//     console.log(`Scraped registered runners count: ${totalEntries}`);

//     // Save to MongoDB
//     await saveToDatabase(totalEntries);
//     console.log("Data successfully saved to the database.");
//   } catch (error) {
//     console.error("Error occurred during scraping:", error);
//   } finally {
//     if (browser) {
//       await browser.close(); // Ensure browser is closed after the scrape
//     }
//   }
// }

// async function saveToDatabase(registeredRunnersCount) {
//   try {
//     console.log("Starting database update...");
//     const updatedRunner = await Runner.findOneAndUpdate(
//       { _id: "6742ea08f778c6c2685744b9" },
//       { registered: registeredRunnersCount, lastUpdated: new Date() },
//       { new: true, upsert: true, runValidators: true }
//     );
//     console.log("Database updated:", updatedRunner);
//   } catch (error) {
//     console.error("Error saving data to MongoDB:", error);
//   }
// }

// async function scrapeRegisteredRunners() {
//   try {
//     await scrape();
//     console.log("Scraping successful!");
//   } catch (error) {
//     console.error("Error in the main process:", error);
//   }
// }

// module.exports = scrapeRegisteredRunners;
// utils/scrapeRegisteredRunners.js
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const Runner = require("../models/runnersModel");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "../.env.local" });

async function scrape() {
  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();
    console.log("Starting the scraping process...");

    await page.goto(
      "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_21032026__kolobrzeska_15stka_zaslubin/11575",
      { timeout: 60000 }
    );

    await page.waitForSelector("#participants_info");
    const registeredRunners = await page.$eval("#participants_info", (el) =>
      el.textContent.trim()
    );

    console.log("RAW TEXT:", registeredRunners);

    // Polish regex for: "Pozycje od 1 do 19 z 19 łącznie"
    const match = registeredRunners.match(/z\s+(\d+)\s+łącznie/);
    if (!match) {
      throw new Error("Unable to extract total entries.");
    }

    const totalEntries = parseInt(match[1], 10);
    console.log(`Scraped registered runners count: ${totalEntries}`);

    // Save to MongoDB
    await saveToDatabase(totalEntries);
    console.log("Data successfully saved to the database.");
  } catch (error) {
    console.error("Error occurred during scraping:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function saveToDatabase(registeredRunnersCount) {
  try {
    console.log("Starting database update...");
    const updatedRunner = await Runner.findOneAndUpdate(
      { _id: "6742ea08f778c6c2685744b9" }, // lub inny Twój dokument
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
