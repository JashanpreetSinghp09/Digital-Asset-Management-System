const mongoose = require("mongoose");

const userCollection = new mongoose.Schema({
    
    email: String,
    firebaseUid: String,
    firstName: String,
    lastName: String
});

const assetCollection = new mongoose.Schema({
    
    title: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    tags: [String],
    description: String,
    filePath: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
    
});

const User = mongoose.model('User', userCollection);
const Asset = mongoose.model('Asset', assetCollection);

module.exports = { User, Asset }