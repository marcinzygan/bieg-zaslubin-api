// const dotenv = require("dotenv");
// const Runner = require("../models/runnersModel");
// const chromium = require("@sparticuz/chromium");
// const { chromium: playwrightChromium } = require("playwright-core");

// // Load environment variables from .env.local
// dotenv.config({ path: "../.env.local" });

// // Function to scrape registered runners
// async function scrape() {
//   const browser = await playwrightChromium.launch({
//     executablePath: await chromium.executablePath(),
//     args: chromium.args,
//     headless: true,
//   });
//   const page = await browser.newPage();

//   try {
//     console.log("Starting the scraping process...");

//     console.log("Starting the scraping process...");
//     await page.goto(
//       "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_kolobrzeska_15stka_zaslubin/9626"
//     );
//     await page.waitForSelector("#participants_info");
//     const registeredRunners = await page.$eval("#participants_info", (el) =>
//       el.textContent.trim()
//     );

//     const match = registeredRunners.match(/z\s+(\d+)\s+łącznie/);
//     console.log(match, "match");

//     const totalEntries = parseInt(match[1], 10);
//     const registeredRunnersCount = parseInt(totalEntries, 10);
//     console.log(`Scraped data: ${registeredRunners}`);
//     console.log(`Scraped registered runners count: ${registeredRunners}`);

//     // Save to MongoDB
//     await saveToDatabase(registeredRunnersCount);
//     console.log("Data successfully saved to the database.");
//   } catch (error) {
//     console.error("Error occurred during scraping:", error);
//   } finally {
//     // Do not close the database connection here.
//     await browser.close();
//   }
// }
// // Function to save data to MongoDB
// async function saveToDatabase(registeredRunnersCount) {
//   try {
//     console.log("Starting database update...");
//     const updatedRunner = await Runner.findOneAndUpdate(
//       { _id: "6742ea08f778c6c2685744b9" },
//       { registered: registeredRunnersCount, lastUpdated: new Date() },
//       { new: true, upsert: true, runValidators: true }
//     );
//     if (updatedRunner) {
//       console.log("Database updated:", updatedRunner);
//     } else {
//       console.log("Runner update failed.");
//     }
//     console.log("Database updated:", updatedRunner);
//   } catch (error) {
//     console.error("Error saving data to MongoDB:", error);
//   }
// }
// // Main function to connect to MongoDB and start the scraper
// async function scrapeRegisteredRunners() {
//   try {
//     // console.log("Connecting to the database...");
//     // await mongoose.connect(DATABASE_STRING);

//     // Start the scraping process
//     await scrape();
//     console.log("scrape successful!");
//   } catch (error) {
//     console.error("Error in the main process:", error);
//   }
// }

// module.exports = scrapeRegisteredRunners;
const { chromium } = require("playwright-aws-lambda");
const dotenv = require("dotenv");
const Runner = require("../models/runnersModel");

// Load environment variables
dotenv.config({ path: "../.env.local" });

async function scrape() {
  let browser; // Define the browser variable here to ensure it's accessible in finally block
  try {
    console.log("Launching Chromium...");
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    console.log("Starting the scraping process...");

    await page.goto(
      "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_kolobrzeska_15stka_zaslubin/9626"
    );

    await page.waitForSelector("#participants_info");
    const registeredRunners = await page.$eval("#participants_info", (el) =>
      el.textContent.trim()
    );

    const match = registeredRunners.match(/z\s+(\d+)\s+łącznie/);
    const totalEntries = parseInt(match[1], 10);
    console.log(`Scraped data: ${registeredRunners}`);
    console.log(`Scraped registered runners count: ${totalEntries}`);

    // Save to MongoDB
    await saveToDatabase(totalEntries);
    console.log("Data successfully saved to the database.");
  } catch (error) {
    console.error("Error occurred during scraping:", error);
  } finally {
    // Ensure browser is closed only if it's been launched successfully
    if (browser) {
      await browser.close();
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
    console.log("scrape successful!");
  } catch (error) {
    console.error("Error in the main process:", error);
  }
}

module.exports = scrapeRegisteredRunners;
