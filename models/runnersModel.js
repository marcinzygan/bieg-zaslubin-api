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
});
const Runner = mongoose.model("Runner", runnerSchema);

module.exports = Runner;
