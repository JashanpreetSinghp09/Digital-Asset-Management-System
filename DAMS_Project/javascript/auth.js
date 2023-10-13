

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

const db = firebaseApp.fireStore();
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