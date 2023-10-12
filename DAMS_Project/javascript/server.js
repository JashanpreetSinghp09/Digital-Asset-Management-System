const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = require("./dams-3565b-firebase-adminsdk-zztmh-23970a084a.json");

const app = express();

const uri = "mongodb+srv://dams-3565b:dams-3565b@dams.lp0lkjv.mongodb.net/?retryWrites=true&w=majority";

// Use async/await for server initialization
async function startServer() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://dams-3565b-default-rtdb.firebaseio.com"
      });
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }

    // Place this inside the 'startServer' function to ensure the database and server are connected
    const db = admin.firestore();
    const auth = admin.auth();

//Middleware for parsing JSON data
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '..', 'html')));

app.use('/javascript', (req, res, next) => {
  res.set('Content-Type', 'application/javascript');
  next();
}, express.static(__dirname));

app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

    // Add these routes to your server code
  app.post('/signup', async (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;

    try {
      // Use Firebase Admin SDK to create a user
      const user = await admin.auth().createUser({
        email,
        password,
      });
      console.log('User created:', user.uid);

      // Handle successful sign-up
      res.json({ success: true });
    } catch (error) {
      console.error('Error creating user:', error);
      res.json({ success: false, error: error.message });
      }
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});

app.listen(8000, () => {
  console.log("Server connected to port 8000");
});
} catch (error) {
  console.error(error);
}
}



// Start the server
startServer();