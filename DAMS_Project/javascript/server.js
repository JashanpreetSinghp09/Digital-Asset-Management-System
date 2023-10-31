const express = require("express");
const mongoose = require("mongoose");
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');
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

    const conn = mongoose.connection;
    Grid.mongo = mongoose.mongo;
    let gfs;
    
    conn.once('open', () => {
        gfs = Grid(conn.db);
        gfs.collection('uploads'); // Set the collection name
    });

    //Importing user model from db.js
    const { User, Asset } = require('./db'); // Import both models from db.js
    // const Asset = dbase.Asset;
    

    
    
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
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '..', 'html')));

app.use('/javascript', (req, res, next) => {
  res.set('Content-Type', 'application/javascript');
  next();
}, express.static(__dirname));

app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

  

//User registration in the servers
app.post('/signup', async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  try {
    // Use Firebase Admin SDK to create a user
    const user = await admin.auth().createUser({
      email,
      password,
    });
    console.log('User created:', user.uid);

    // Create a new document in MongoDB to store the email and UID
    const newUser = new User({
      email: user.email,
      firebaseUid: user.uid,
      firstName: firstName,
      lastName: lastName
    });

    newUser.save()
      .then((savedUser) => {
        console.log('User data saved successfully:', savedUser);
        // Handle successful sign-up
        res.json({ success: true });
      })
      .catch((error) => {
        console.error('Error saving user data:', error);
        res.json({ success: false, error: error.message });
      });
  } catch (error) {
    console.error('Error creating user:', error);
    res.json({ success: false, error: error.message });
  }
});

//Changing user details in the server
app.post('/changeUserDetails', async (req, res) => {
  console.log(req.body);
  const { email, firebaseUid, firstName, lastName } = req.body;

  try {
    // Use Firebase Admin SDK to update the user's email
    await admin.auth().updateUser(firebaseUid, { email });

    // Update the user's details in the MongoDB database
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: firebaseUid },
      { email, firstName, lastName },
      { new: true } // To get the updated document
    );

    if (updatedUser) {
      res.json({ success: true, updatedUser });
    } else {
      res.json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/deleteDetails', async (req, res) => {
  const { firebaseUid } = req.body;

  try {
    // Use Firebase Admin SDK to delete the user by UID
    await admin.auth().deleteUser(firebaseUid);

    // Delete the user's details from the MongoDB database
    const deletedUser = await User.findOneAndDelete({ firebaseUid: firebaseUid });

    if (deletedUser) {
      res.json({ success: true, message: 'User details deleted' });
    } else {
      res.json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

//Used for fetching email from server
app.get('/getUid', async (req, res) => {
  const email = req.query.email; // You can pass the email as a query parameter
  const user = await User.findOne({ email: email }); // Query MongoDB for the user by email

  if (user) {
    res.json({ uid: user.firebaseUid });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});


// const multer = require('multer');


// Set up a Multer storage engine to handle file uploads
// const storage = multer.diskStorage({
//     destination: 'upload_files/', // Directory where uploaded files will be stored
//     filename: function (req, file, callback) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         callback(null, file.fieldname + '-' + uniqueSuffix);
//     }
// });


// const upload = multer({ storage: storage });

// Route to handle file uploads
// app.post('/upload', upload.single('file'), async (req, res) => {
//   console.log(req.body, file.originalname, file.tags, file.description);
//     try {
//         const { file, tags, description } = req.body;
//         const filePath = req.file.path; // Path to the uploaded file

//         // test
//         console.log(file.originalname, tags, description);
//       //


//         // Create a new Asset document and save it to the database
//         const asset = new Asset({
//             title: file.originalname,
//             fileType: 'image', // You can determine the file type based on the uploaded file
//             tags: JSON.parse(tags),
//             description,
//             filePath,
//         });

//         await asset.save();

//         res.json({ success: true });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });



// Handle file uploads
app.post('/upload', (req, res) => {
  const { file, tags, description } = req.body;

  if (!file || !tags || !description) {
      return res.status(400).json({ success: false, error: 'Missing file, tags, or description' });
  }

  const writeStream = gfs.createWriteStream({
      filename: file.originalname,
      metadata: {
          tags: JSON.parse(tags),
          description: description,
      },
  });

  writeStream.on('close', (file) => {
      res.json({ success: true });
  });

  writeStream.on('error', (error) => {
      res.status(500).json({ success: false, error: error.message });
  });

  writeStream.write(file.data);
  writeStream.end();
});


//Pointing the server.js to index.html
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