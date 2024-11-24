const express = require("express");
const {
  createRunner,
  getAllRunners,
  updateRunner,
  scrapeRunners,
} = require("../controllers/runnersController");
const runnersRouter = express.Router();

// PRODUCT MAIN ROUTE
runnersRouter.route("/").get(getAllRunners);
runnersRouter.route("/scrape").post(scrapeRunners);
// runnersRouter.route("/new").post(createRunner);
// runnersRouter.route("/:id").patch(updateRunner);

module.exports = runnersRouter;
