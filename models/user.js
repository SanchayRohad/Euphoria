const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  sid: String,
  name: String,
  score: Number,
});

module.exports = mongoose.model("User", userSchema);
