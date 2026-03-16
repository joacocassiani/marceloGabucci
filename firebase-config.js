 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
  apiKey: "AIzaSyCbxqW5ynVQ8JllUa5g_g9_txda6ohN1EA",
  authDomain: "marcelogabucci-75590.firebaseapp.com",
  projectId: "marcelogabucci-75590",
  storageBucket: "marcelogabucci-75590.firebasestorage.app",
  messagingSenderId: "115728896207",
  appId: "1:115728896207:web:82b9d84f819ce3bf3267ba",
  measurementId: "G-XY7P8ZK02V"
};

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);