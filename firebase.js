// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCo--Ajq5U0rVIhSYhJanZpI1Hjj1LtitE",
  authDomain: "fyp2024-c329b.firebaseapp.com",
  projectId: "fyp2024-c329b",
  storageBucket: "fyp2024-c329b.appspot.com",
  messagingSenderId: "468813287126",
  appId: "1:468813287126:web:61141c50f007ddde5b8377"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export {auth, getAuth};