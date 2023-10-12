const mongoose = require("mongoose");

const userCollection = new mongoose.Schema({
    
    email: String,
    firebaseUid: String
});

module.exports = mongoose.model('User', userCollection);