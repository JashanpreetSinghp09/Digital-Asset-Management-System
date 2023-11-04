

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

    // Storing the email locally for future reference
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
  console.log(formData);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('File upload failed');
      }
    })
    .then(data => {
      console.log(data.message);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}