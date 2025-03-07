// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: "interactiveboardforpassport.firebaseapp.com",
  projectId: "interactiveboardforpassport",
  storageBucket: "interactiveboardforpassport.firebasestorage.app",
  messagingSenderId: "814516910899",
  appId: "1:814516910899:web:b7a7b47d3f447f92585c46",
  measurementId: "G-KH8TTE3PBX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);