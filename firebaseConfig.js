import firebase from 'firebase/compat/app';
import auth from 'firebase/compat/auth';
import storage from 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCo--Ajq5U0rVIhSYhJanZpI1Hjj1LtitE",
    authDomain: "fyp2024-c329b.firebaseapp.com",
    projectId: "fyp2024-c329b",
    storageBucket: "fyp2024-c329b.appspot.com",
    messagingSenderId: "468813287126",
    appId: "1:468813287126:web:61141c50f007ddde5b8377"
  };

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };