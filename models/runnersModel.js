const mongoose = require("mongoose");

const runnerSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  registered: {
    type: Number,
  },
  runnerID: {
    type: Number,
  },
  lastUpdated: {
    type: Date,
    default: Date.now(),
  },
});
const Runner = mongoose.model("Runner", runnerSchema);

module.exports = Runner;
