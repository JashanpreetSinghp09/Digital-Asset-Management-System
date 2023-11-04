const mongoose = require("mongoose");

// User Collection Schema
const userCollection = new mongoose.Schema({
  email: String,
  firebaseUid: String,
  firstName: String,
  lastName: String,
});


const User = mongoose.model("User", userCollection);

module.exports = { User };
