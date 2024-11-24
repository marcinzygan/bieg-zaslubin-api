// Import necessary modules
import puppeteer from "puppeteer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Runner from "../../models/runnersModel";

// Load environment variables from .env.local
dotenv.config({ path: "./.env.local" });

// MongoDB connection string
const DATABASE_STRING = process.env.DATABASE_STRING.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Function to scrape the registered runners count
const scrapeRegisteredRunners = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("Starting the scraping process...");

    // Navigate to the page containing the participants information
    await page.goto(
      "https://b4sportonline.pl/biegi_kolobrzeg/lista_uczestnikow_kolobrzeska_15stka_zaslubin/9626"
    );
    await page.waitForSelector("#participants_info");

    // Scrape the registered runners count
    const registeredRunners = await page.$eval("#participants_info", (el) =>
      el.textContent.trim()
    );
    const match = registeredRunners.match(/of (\d+) entries/i);
    const totalEntries = parseInt(match[1], 10);

    console.log(`Scraped registered runners count: ${totalEntries}`);

    // Save the scraped value to the MongoDB database
    await saveToDatabase(totalEntries);
    console.log("Data successfully saved to the database.");
  } catch (error) {
    console.error("Error occurred during scraping:", error);
  } finally {
    await browser.close();
  }
};

// Function to save the scraped data to MongoDB
const saveToDatabase = async (registeredRunnersCount) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(DATABASE_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");

    // Update or insert the runner document
    const updatedRunner = await Runner.findOneAndUpdate(
      { _id: "6742ea08f778c6c2685744b9" }, // Use the document ID that you want to update
      { registered: registeredRunnersCount, lastUpdated: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    console.log("Database updated:", updatedRunner);
  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// API route handler
export default async function handler(req, res) {
  try {
    // Run the scraping function
    await scrapeRegisteredRunners();

    // Send a response back
    res.status(200).json({ message: "Scraping task completed successfully" });
  } catch (error) {
    console.error("Error in API handler:", error);
    res.status(500).json({ error: "Failed to complete scraping task" });
  }
}
