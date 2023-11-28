

// Sign Up
function SignUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("passwordConfirm").value;

  if (!(password == confirmPassword)) {
    window.alert("Password does not match!");
  } else {

   const firstName = document.getElementById("firstName").value;
   const lastName = document.getElementById("lastName").value;
    
   const data = {
     firstName: firstName,
     lastName: lastName,
     email: email,
     password: password

   };

   console.log(data);

    // Send a POST request to the server for user sign-up
    fetch('/signup', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify(data),
   })
     .then((response) => {
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       return response.json();
     })
     .then((data) => {
       // Handle the response from the server
       if (data.success) {
         window.alert("You are Signed Up!");
         localStorage.setItem('email', email);
         window.location.href = "signIn.html";
       } else {
         window.alert("Error: " + data.error);
       }
     })
     .catch((error) => {
       console.error('Fetch error:', error);
       window.alert('Fetch error: ' + error.message);
     });
  }
}

// setting up firebase authentication for user login
const firebaseApp = firebase.initializeApp({ 
   apiKey: "AIzaSyAq_JJxWK6AGB5cGlxCVoWDItXTBvHoKyU",
   authDomain: "dams-3565b.firebaseapp.com",
   projectId: "dams-3565b",
   storageBucket: "dams-3565b.appspot.com",
   messagingSenderId: "665759459781",
   appId: "1:665759459781:web:efda5177907e8e764c43ac",
   measurementId: "G-7X1SY1V2NX"
});

//const db = firebaseApp.fireStore();
const auth = firebaseApp.auth();

// Sign In
function SignIn() {
 const email = document.getElementById("email").value;
 const password = document.getElementById("password").value;
 console.log(email, password);

 firebase.auth().signInWithEmailAndPassword(email, password)
.then((result) => {
  // Signed in
    console.log("You are Signed In!");
    console.log(result);

    // Get the UID from the result
    const firebaseUid = result.user.uid;

    // Storing the UID and email locally for future reference
    localStorage.setItem('firebaseUid', firebaseUid);
    localStorage.setItem('email', email);

    window.location.href = "home.html";
    // ...
})
.catch((error) => {
    console.log(error.code);
    console.log(error.message);
    window.alert("Error: " + error.message);
});
}

//Function for changing user details
function ChangeUserDetails() {
  const newEmail = document.getElementById('newEmail').value; // Get the new email input value
  const newFirstName = document.getElementById('newFirstName').value;
  const newLastName = document.getElementById('newLastName').value;

  const user = firebase.auth().currentUser;

  const data = {
    email: newEmail,
    firebaseUid: user.uid,
    firstName: newFirstName,
    lastName: newLastName

  };

fetch('/changeUserDetails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify( data ),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    if (data.success) {
      window.alert("User Details changed successfully!");
  
      // Trigger sign-out and redirection
      firebase.auth().signOut().then(function() {
        // Sign-out successful, redirect to signin.html
        window.location.href = "signin.html";
      }).catch(function(error) {
        console.error('Error signing out:', error);
      });
    } else {
      window.alert("Error: " + data.error);
    }
  })
  .catch((error) => {
    console.error('Fetch error:', error);
  });
}

function isValidEmail(email) {
  // A simple email validation regex (you can use a more complex one if needed)
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  return emailRegex.test(email);
}


//Change password

function UpdatePassword() {
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword1').value;
  const confirmPassword = document.getElementById('confirmPassword1').value;

  // Check if the new password and confirm password match
  if (newPassword !== confirmPassword) {
    alert('New password and confirm password do not match.');
    return;
  }

  // Set up an observer to listen for changes in the authentication state
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Reauthenticate the user with their old password
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);

      user
        .reauthenticateWithCredential(credential)
        .then(function () {
          // Change the password for the user
          user
            .updatePassword(newPassword)
            .then(function () {
              alert('Password updated successfully');

              // Clear the password fields
              const oldPasswordField = document.getElementById('oldPassword');
              const newPasswordField = document.getElementById('newPassword1');
              const confirmPasswordField = document.getElementById('confirmPassword1');

              if (oldPasswordField) {
                oldPasswordField.value = '';
              }

              if (newPasswordField) {
                newPasswordField.value = '';
              }

              if (confirmPasswordField) {
                confirmPasswordField.value = '';
              }
            })
            .catch(function (error) {
              alert('Error updating password: ' + error.message);
            });
        })
        .catch(function (error) {
          alert('Error reauthenticating user: ' + error.message);
        });
    } else {
      alert('User not authenticated. Please sign in.');
    }
  });
}

function DeleteUser(){

  const user = firebase.auth().currentUser;

  const userData = {
    firebaseUid: user.uid
  };

  // Make a POST request to the server to delete the user details
  fetch('/deleteDetails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // User details were successfully deleted
        alert('User details deleted!');
        window.location.href = "index.html";
      } else {
        // Handle the error
        console.error('Error:', data.error);
      }
    })
    .catch((error) => {
      console.error('Request error:', error);
    });
}
async function uploadPublicFile() {
  const fileInput = document.getElementById('file-input');
  const tagsInput = document.getElementById('tags-input');
  const descriptionInput = document.getElementById('description-input');

  const formData = new FormData();
  formData.append('tags', tagsInput.value);
  formData.append('description', descriptionInput.value);
  formData.append('file', fileInput.files[0]);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // File uploaded successfully
      window.alert("File Upload Success");
    } else {
      // File upload failed
      window.alert("File Upload Failed: " + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    window.alert('File upload error: ' + error.message);
  });
}

async function uploadFile() {
  const fileInput = document.getElementById('file-input');
  const tagsInput = document.getElementById('tags-input');
  const descriptionInput = document.getElementById('description-input');

  const user = firebase.auth().currentUser;
  const firebaseUid = user.uid;
  

  const formData = new FormData();
  formData.append('tags', tagsInput.value);
  formData.append('description', descriptionInput.value);
  formData.append('firebaseUid', firebaseUid);
  formData.append('file', fileInput.files[0]);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // File uploaded successfully
      window.alert("File Upload Success");
    } else {
      // File upload failed
      window.alert("File Upload Failed: " + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    window.alert('File upload error: ' + error.message);
  });
}

// Helper function to categorize assets based on fileType
function categorizeAssets(assets) {
  const categorizedAssets = {
    Images: [],
    Audio: [],
    Video: [],
    Docs:[],
    Other: [],
  };

  assets.forEach((asset) => {
    const fileType = getFileType(asset.filename);
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'pdf':
      case 'gif':
        categorizedAssets.Images.push(asset);
        break;
      case 'mp3':
        categorizedAssets.Audio.push(asset);
        break;
      case 'mp4':
        categorizedAssets.Video.push(asset);
        break;
      case 'pdf':
        categorizedAssets.Docs.push(asset);
        break;
      default:
        categorizedAssets.Other.push(asset);
        break;
    }
  });

  // Remove categories with empty arrays
  for (const category in categorizedAssets) {
    if (categorizedAssets[category].length === 0) {
      delete categorizedAssets[category];
    }
  }

  return categorizedAssets;
}

// Helper function to get the fileType from the filename
function getFileType(filename) {
  const extension = filename.split('.').pop();
  return extension.toLowerCase();
}

// Helper function to generate HTML for each asset
function generateAssetHTML(asset) {
  const assetElement = document.createElement('div');
  assetElement.classList.add('asset-item');

  // Determine the asset type based on the file extension or contentType
  let mediaTag, width, height;
  if (asset.contentType.startsWith('image/')) {
    mediaTag = 'img';
    width = '500';
    height = '500';
  } else if (asset.contentType.startsWith('video/')) {
    mediaTag = 'video';
    width = '500';
    height = '500';
  } else if (asset.contentType.startsWith('audio/')) {
    mediaTag = 'audio';
  } else if (asset.contentType === 'application/pdf') {
    // For PDF files, use an iframe
    mediaTag = 'iframe';
    width = '100%';
    height = '500px'; // Adjust the height as needed
  } else {
    // For other file types, use an image tag by checking the file extension
    const fileExtension = asset.filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      mediaTag = 'img';
      width = '500';
      height = '500';
    } else if (['mp3'].includes(fileExtension)) {
      mediaTag = 'audio';
    } else if (['mp4'].includes(fileExtension)) {
      mediaTag = 'video';
      width = '500';
      height = '500';
    } else {
      // If the type is not recognized, default to an image tag
      mediaTag = 'img';
      width = '500';
      height = '500';
    }
  }

  // Create the media element based on the asset type
  const mediaElement = document.createElement(mediaTag);
  mediaElement.src = `/download/${asset._id}`;
  mediaElement.alt = asset.filename;
  mediaElement.controls = true;

  // Set width and height attributes
  mediaElement.width = width;
  mediaElement.height = height;

  // Create a link to the download route
  const downloadLink = document.createElement('a');
  downloadLink.href = `/download/${asset._id}`;
  downloadLink.target = '_blank';

  // Create a paragraph to display the filename
  const filenameParagraph = document.createElement('p');
  filenameParagraph.textContent = asset.filename;

  // Create a delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('delete_btn');
  deleteButton.addEventListener('click', () => {
    // Call a function to delete the asset on the server
    deleteAsset(asset._id);
  });

  // Append the media element to the asset element
  assetElement.appendChild(mediaElement);

  // Append the link to the asset element
  assetElement.appendChild(downloadLink);

  // Append the filename paragraph to the link
  downloadLink.appendChild(filenameParagraph);

  // Append the delete button to the asset element
  assetElement.appendChild(deleteButton);

  return assetElement;
}

function generatePublicAssetHTML(asset) {
  const assetElement = document.createElement('div');
  assetElement.classList.add('asset-item');

  // Determine the asset type based on the file extension or contentType
  let mediaTag, width, height;
  if (asset.contentType.startsWith('image/')) {
    mediaTag = 'img';
    width = '500';
    height = '500';
  } else if (asset.contentType.startsWith('video/')) {
    mediaTag = 'video';
    width = '500';
    height = '500';
  } else if (asset.contentType.startsWith('audio/')) {
    mediaTag = 'audio';
  } else if (asset.contentType === 'application/pdf') {
    // For PDF files, use an iframe
    mediaTag = 'iframe';
    width = '100%';
    height = '500px'; // Adjust the height as needed
  } else {
    // For other file types, use an image tag by checking the file extension
    const fileExtension = asset.filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      mediaTag = 'img';
      width = '500';
      height = '500';
    } else if (['mp3'].includes(fileExtension)) {
      mediaTag = 'audio';
    } else if (['mp4'].includes(fileExtension)) {
      mediaTag = 'video';
      width = '500';
      height = '500';
    } else {
      // If the type is not recognized, default to an image tag
      mediaTag = 'img';
      width = '500';
      height = '500';
    }
  }

  // Create the media element based on the asset type
  const mediaElement = document.createElement(mediaTag);
  mediaElement.src = `/download/${asset._id}`;
  mediaElement.alt = asset.filename;
  mediaElement.controls = true;

  // Set width and height attributes
  mediaElement.width = width;
  mediaElement.height = height;

  // Create a link to the download route
  const downloadLink = document.createElement('a');
  downloadLink.href = `/download/${asset._id}`;
  downloadLink.target = '_blank';

  // Create a paragraph to display the filename
  const filenameParagraph = document.createElement('p');
  filenameParagraph.textContent = asset.filename;

  // Append the media element to the asset element
  assetElement.appendChild(mediaElement);

  // Append the link to the asset element
  assetElement.appendChild(downloadLink);

  // Append the filename paragraph to the link
  downloadLink.appendChild(filenameParagraph);

  return assetElement;
}


// Function to delete an asset on the server
async function deleteAsset(assetId) {
  try {
    const response = await fetch(`/delete/${assetId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      // Asset deleted successfully, update the UI or handle as needed
      console.log('Asset deleted successfully');

      // Reload the page
      window.location.reload();
    } else {
      // Handle the case where deletion failed
      console.error('Error deleting asset:', result.error);
    }
  } catch (error) {
    console.error('Error deleting asset:', error);
  }
}

// Function to fetch and display user's assets with categories
async function displayUserAssets() {
  const firebaseUid = localStorage.getItem('firebaseUid');

  // Fetch the user's assets from the server
  fetch(`/get-user-assets?firebaseUid=${firebaseUid}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const assetsContainer = document.querySelector('.assets');

        // Clear the current contents of the assets div
        assetsContainer.innerHTML = '';

        // Organize assets into categories
        const categorizedAssets = categorizeAssets(data.assets);

        // Loop through the categories and generate HTML for each
        for (const [category, assets] of Object.entries(categorizedAssets)) {
          // Create a category container
          const categoryContainer = document.createElement('div');
          categoryContainer.classList.add('asset-category');

          // Create a heading for the category
          const categoryHeading = document.createElement('h2');
          categoryHeading.textContent = category;
          categoryContainer.appendChild(categoryHeading);

          // Loop through the assets in the category and generate HTML for each
          assets.forEach((asset) => {
            const assetElement = generateAssetHTML(asset);
            categoryContainer.appendChild(assetElement);
          });

          // Append the category container to the assets container
          assetsContainer.appendChild(categoryContainer);
        }
      } else {
        console.error('Error fetching user assets:', data.error);
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
}

// Function to filter user's assets based on search query with categories
function filterUserAssets() {
  const searchInput = document.getElementById('search-input');
  const searchQuery = searchInput.value.trim().toLowerCase();

  // If the search query is empty, just display all assets
  if (searchQuery === '') {
    displayUserAssets();
    return;
  }

  const firebaseUid = localStorage.getItem('firebaseUid');

  // Fetch the assets for filtering based on the search query
  fetch(`/get-user-assets?firebaseUid=${firebaseUid}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const assetsContainer = document.querySelector('.assets');

        // Clear the current contents of the assets div
        assetsContainer.innerHTML = '';

        // Filter assets based on the search query
        const filteredAssets = data.assets.filter((asset) =>
          asset.filename.toLowerCase().includes(searchQuery)
        );

        // Organize filtered assets into categories
        const categorizedAssets = categorizeAssets(filteredAssets);

        // Loop through the categories and generate HTML for each
        for (const [category, assets] of Object.entries(categorizedAssets)) {
          // Create a category container
          const categoryContainer = document.createElement('div');
          categoryContainer.classList.add('asset-category');

          // Create a heading for the category
          const categoryHeading = document.createElement('h2');
          categoryHeading.textContent = category;
          categoryContainer.appendChild(categoryHeading);

          // Loop through the assets in the category and generate HTML for each
          assets.forEach((asset) => {
            const assetElement = generateAssetHTML(asset);
            categoryContainer.appendChild(assetElement);
          });

          // Append the category container to the assets container
          assetsContainer.appendChild(categoryContainer);
        }
      } else {
        console.error('Error fetching user assets:', data.error);
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
}

// Function to fetch and display public assets with categories
async function displayPublicAssets(category = null) {
  // Fetch the user's assets from the server
  fetch(`/get-files`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const assetsContainer = document.querySelector('.categories');

        // Clear the current contents of the assets div
        assetsContainer.innerHTML = '';

        // Organize assets into categories
        const categorizedAssets = categorizeAssets(data.assets);

        if (category) {
          // Display only the specified category
          const assetsInCategory = categorizedAssets[category];
          if (assetsInCategory) {
            const categoryContainer = document.createElement('div');
            categoryContainer.classList.add('asset-category');

            // Create a heading for the category
            const categoryHeading = document.createElement('h2');
            categoryHeading.textContent = category;
            categoryContainer.appendChild(categoryHeading);

            // Loop through the assets in the category and generate HTML for each
            assetsInCategory.forEach((asset) => {
              const assetElement = generatePublicAssetHTML(asset);
              categoryContainer.appendChild(assetElement);
            });

            // Append the category container to the assets container
            assetsContainer.appendChild(categoryContainer);
          }
        } else {
          // Loop through all categories and generate HTML for each
          for (const [category, assets] of Object.entries(categorizedAssets)) {
            const categoryContainer = document.createElement('div');
            categoryContainer.classList.add('asset-category');

            // Create a heading for the category
            const categoryHeading = document.createElement('h2');
            categoryHeading.textContent = category;
            categoryContainer.appendChild(categoryHeading);

            // Loop through the assets in the category and generate HTML for each
            assets.forEach((asset) => {
              const assetElement = generatePublicAssetHTML(asset);
              categoryContainer.appendChild(assetElement);
            });

            // Append the category container to the assets container
            assetsContainer.appendChild(categoryContainer);
          }
        }
      } else {
        console.error('Error fetching user assets:', data.error);
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
}

// Function to filter user's assets based on search query with categories
function filterPublicAssets(category = null) {
  const searchInput = document.getElementById('search-input');
  const searchQuery = searchInput.value.trim().toLowerCase();

  // If the search query is empty, just display all assets
  if (searchQuery === '') {
    displayPublicAssets(category);
    return;
  }

  // Fetch the assets for filtering based on the search query
  fetch(`/get-files`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const assetsContainer = document.querySelector('.categories');

        // Clear the current contents of the assets div
        assetsContainer.innerHTML = '';

        // Filter assets based on the search query
        const filteredAssets = data.assets.filter((asset) =>
          asset.filename.toLowerCase().includes(searchQuery)
        );

        // Organize filtered assets into categories
        const categorizedAssets = categorizeAssets(filteredAssets);

        if (category) {
          // Display only the specified category
          const assetsInCategory = categorizedAssets[category];
          if (assetsInCategory) {
            const categoryContainer = document.createElement('div');
            categoryContainer.classList.add('asset-category');

            // Create a heading for the category
            const categoryHeading = document.createElement('h2');
            categoryHeading.textContent = category;
            categoryContainer.appendChild(categoryHeading);

            // Loop through the assets in the category and generate HTML for each
            assetsInCategory.forEach((asset) => {
              const assetElement = generatePublicAssetHTML(asset);
              categoryContainer.appendChild(assetElement);
            });

            // Append the category container to the assets container
            assetsContainer.appendChild(categoryContainer);
          }
        } else {
          // Loop through all categories and generate HTML for each
          for (const [category, assets] of Object.entries(categorizedAssets)) {
            const categoryContainer = document.createElement('div');
            categoryContainer.classList.add('asset-category');

            // Create a heading for the category
            const categoryHeading = document.createElement('h2');
            categoryHeading.textContent = category;
            categoryContainer.appendChild(categoryHeading);

            // Loop through the assets in the category and generate HTML for each
            assets.forEach((asset) => {
              const assetElement = generatePublicAssetHTML(asset);
              categoryContainer.appendChild(assetElement);
            });

            // Append the category container to the assets container
            assetsContainer.appendChild(categoryContainer);
          }
        }
      } else {
        console.error('Error fetching user assets:', data.error);
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
}
