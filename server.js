const mongoose = require("mongoose");
const { exec } = require("child_process");
const fs = require("fs");
const dotenv = require("dotenv");
//ENV config
dotenv.config({ path: "./.env.local" });

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
