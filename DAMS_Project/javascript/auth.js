 // setting up firebase authentication for user registration


 const firebaseApp = firebase.initializeApp({ 
        apiKey: "AIzaSyAq_JJxWK6AGB5cGlxCVoWDItXTBvHoKyU",
        authDomain: "dams-3565b.firebaseapp.com",
        projectId: "dams-3565b",
        storageBucket: "dams-3565b.appspot.com",
        messagingSenderId: "665759459781",
        appId: "1:665759459781:web:efda5177907e8e764c43ac",
        measurementId: "G-7X1SY1V2NX"
    
    });

    // const firebaseConfig = {
        
    //   };
    const db = firebaseApp.firestore();
    const auth = firebaseApp.auth();
    
    // Sign Up
    
    function SignUp() {
       const email = document.getElementById("email").value;
       const password = document.getElementById("password").value;
       const confirmPassword = document.getElementById("passwordConfirm").value;

       if(!(password == confirmPassword)) {
        window.alert("Password does not match!");

       } else{
        console.log(email, password);
    
        firebase.auth().createUserWithEmailAndPassword(email, password)   // code from official firebase documentation
           .then((result) => {
              // Signed up 
              window.alert("You are Signed Up!");
              console.log(result);
              // ...
           })
           .catch((error) => {
             console.log(error.code);
             console.log(error.message);
             window.alert("Error: " + error.message);
              // ..
           });
       }
       
    }
    
    function SignIn() {
       const email = document.getElementById("email").value;
       const password = document.getElementById("password").value;
       console.log(email, password);
    
       firebase.auth().signInWithEmailAndPassword(email, password)
      .then((result) => {
        // Signed in
          console.log("You are Signed In!");
          console.log(result);
          window.location.href = "home.html";
          // ...
      })
      .catch((error) => {
          console.log(error.code);
          console.log(error.message);
          window.alert("Error: " + error.message);
      });
    }