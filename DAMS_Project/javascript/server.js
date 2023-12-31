const express = require("express");
const mongoose = require("mongoose");
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = require("./dams-3565b-firebase-adminsdk-zztmh-23970a084a.json");
const { User} = require('./db') //Importing user model from db.js

const app = express();

const uri = "mongodb+srv://dams-3565b:dams-3565b@dams.lp0lkjv.mongodb.net/?retryWrites=true&w=majority";

// Declare gfs at the top level
let gfs;
let gridFSBucket;

async function initializeFirebase(){

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://dams-3565b-default-rtdb.firebaseio.com"
    });
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

// Use async/await for server initialization
async function startServer() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    mongoose.set('strictQuery', false);

    const conn = mongoose.connection;

    conn.once('open', () => {
      gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection('uploads');

      // Initialize GridFSBucket
      gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
      });
    });

    const storage = new GridFsStorage({
      url: uri,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      file: (req, file) => {
        const metadata = {
          tags: req.body.tags,
          description: req.body.description,
        };
    
        if (req.body.firebaseUid) {
          metadata.firebaseUid = req.body.firebaseUid;
        }
    
        return {
          bucketName: 'uploads',
          filename: file.originalname,
          metadata: metadata,
        };
      },
    });
    

    const upload = multer({ storage });
  
    

    // Place this inside the 'startServer' function to ensure the database and server are connected
    const db = admin.firestore();
    const auth = admin.auth();

//Middleware for parsing JSON data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
  const email = req.query.email; 
  const user = await User.findOne({ email: email }); // Query MongoDB for the user by email

  if (user) {
    res.json({ uid: user.firebaseUid });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    // Assuming the upload was successful
    res.status(200).json({ message: 'File uploaded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/get-user-assets', async (req, res) => {
  const { firebaseUid } = req.query; 

  try {
    if (!gfs) {
      gfs = Grid(mongoose.connection.db, mongoose.mongo);
      gfs.collection('uploads');
    }

    const userAssets = await gfs.files.find({ 'metadata.firebaseUid': firebaseUid }).toArray();

    res.json({ success: true, assets: userAssets });
  } catch (error) {
    console.error('Error fetching user assets:', error);
    res.json({ success: false, error: 'Error fetching user assets' });
  }
});

app.get('/get-files', async (req, res) => {
  try {
    if (!gfs) {
      gfs = Grid(mongoose.connection.db, mongoose.mongo);
      gfs.collection('uploads');
    }

    // Find files where 'metadata.firebaseUid' is null or not present
    const publicAssests = await gfs.files.find({
      $or: [
        { 'metadata.firebaseUid': null },
        { 'metadata.firebaseUid': { $exists: false } },
      ],
    }).toArray();

    res.json({ success: true, assets: publicAssests });
  } catch (error) {
    console.error('Error fetching files without firebaseUid:', error);
    res.json({ success: false, error: 'Error fetching files without firebaseUid' });
  }
});


// The route to display and download a file
app.get('/download/:fileId', async (req, res) => {
  try {
    if (!gfs) {
      gfs = Grid(mongoose.connection.db, mongoose.mongo);
      gfs.collection('uploads');
    }

    // Ensure gridFSBucket is initialized
    if (!gridFSBucket) {
      gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
      });
    }

    const fileId = mongoose.Types.ObjectId(req.params.fileId);

    const downloadStream = gridFSBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ success: false, error: 'Error downloading file' });
  }
});

// The route to delete a file
app.delete('/delete/:fileId', async (req, res) => {
  try {
    // Ensure gridFSBucket is initialized
    if (!gridFSBucket) {
      gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
      });
    }

    const fileId = mongoose.Types.ObjectId(req.params.fileId);

    // Delete the file from GridFS
    await gridFSBucket.delete(fileId);

    // Also delete the corresponding metadata entry
    await gfs.files.deleteOne({ _id: fileId });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: 'Error deleting file' });
  }
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
initializeFirebase().then(() => startServer());