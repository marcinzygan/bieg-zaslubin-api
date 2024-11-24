const cron = require("node-cron");
const main = require("./scraper");

// Schedule the scraper to run every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running the scraping task...");
  await main();
});
