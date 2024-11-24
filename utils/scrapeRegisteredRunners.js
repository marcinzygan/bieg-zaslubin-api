const edgeChromium = require("chrome-aws-lambda");

// Importing Puppeteer core as default otherwise
// it won't function correctly with "launch()"
const puppeteer = require("puppeteer-core");
const dotenv = require("dotenv");
const Runner = require("../models/runnersModel");

// Load environment variables from .env.local
dotenv.config({ path: "../.env.local" });

async function scrape() {
  console.log(puppeteer);

  let browser;
  const LOCAL_CHROME_EXECUTABLE = "/usr/bin/google-chrome";
  try {
    const executablePath =
      (await edgeChromium.executablePath) || LOCAL_CHROME_EXECUTABLE;

    browser = await puppeteer.launch({
      args: edgeChromium.args,
      executablePath: executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    console.log("Starting the scraping process...");

    await page.goto(
      "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_kolobrzeska_15stka_zaslubin/9626",
      { timeout: 30000 } // 30 seconds timeout to avoid hanging
    );

    await page.waitForSelector("#participants_info");
    const registeredRunners = await page.$eval("#participants_info", (el) =>
      el.textContent.trim()
    );
    console.log(registeredRunners);

    // Match the total registered runners using a regular expression
    const match = registeredRunners.match(/of\s+(\d+)\s+entries/);
    if (!match) {
      throw new Error("Unable to extract total entries.");
    }
    const totalEntries = parseInt(match[1], 10);
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
