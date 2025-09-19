// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgynzn4Ni6v4LFEDCm1khS35n7T5-ITxY",
  authDomain: "classroom-app-3ee5e.firebaseapp.com",
  projectId: "classroom-app-3ee5e",
  storageBucket: "classroom-app-3ee5e.appspot.com",
  messagingSenderId: "91309937104",
  appId: "1:91309937104:web:3a54d43fe2fdd04268e9d5",
  measurementId: "G-CDR162C7ZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported (e.g., not on server-side)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, analytics };