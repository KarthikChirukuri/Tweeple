// models/testUser.js
const mongoose = require("mongoose");

const testUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TestUser", testUserSchema);
