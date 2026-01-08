// // models/log.js
// const mongoose = require("mongoose");

// const logSchema = new mongoose.Schema({
//   type: String,
//   message: String,
//   ip: String,
//   url: String,
//   time: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Log", logSchema);


const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: { type: String, required: true },
  rule: { type: String },
  message: { type: String },
  ip: { type: String },
  url: { type: String },
  userId: { type: String, default: null },

  payload: { type: String, default: "" },

  reported: { type: Boolean, default: false },
  reportedAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);
