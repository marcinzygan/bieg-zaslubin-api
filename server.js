const mongoose = require("mongoose");
const { exec } = require("child_process");
const fs = require("fs");
const dotenv = require("dotenv");
//ENV config
dotenv.config({ path: "./.env.local" });
function installChromiumDependencies() {
  return new Promise((resolve, reject) => {
    exec(
      "apt-get update && apt-get install -y libnss3 libgdk-pixbuf2.0-0 libx11-xcb1 libxcomposite1 libxrandr2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libnspr4 libxss1",
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error installing dependencies: ${stderr}`);
          reject(error);
        } else {
          console.log(stdout);
          resolve();
        }
      }
    );
  });
}

installChromiumDependencies()
  .then(() => {
    console.log("Chromium dependencies installed successfully!");
    // Now proceed to run your scraping logic or load your application
  })
  .catch((error) => {
    console.error("Error during installation:", error);
  });
// Import the scheduler to run it when the server starts
// require("./scheduler"); // This line will start the scheduled task

// Handling Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log("💥uncaughtException💥", err);
  console.log("💥 The APP will shut down ... 💥");

  process.exit(1);
});

const app = require("./app");

// CONENCT TO DATABASE
const DB = process.env.DATABASE_STRING.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {}).then(() => {
  console.log("DB connection sucesfull");
});

const port = process.env.PORT || 8000;
// APP START
const server = app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

// Handling Unhandled Rejections
process.on("unhandledRejection", (err) => {
  console.log("💥unhandledRejection💥", err);
  console.log("💥 The APP will shut down .... 💥");
  server.close(() => {
    process.exit(1);
  });
});
