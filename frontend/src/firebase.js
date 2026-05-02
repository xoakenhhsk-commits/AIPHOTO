import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// 1. Go to Firebase Console (https://console.firebase.google.com/)
// 2. Add a new Web App to your project
// 3. Copy the firebaseConfig object and paste it below
const firebaseConfig = {
  apiKey: "AIzaSyCvDrpwODTwVafqJXZ-sebH87Soj6pw6T4",
  authDomain: "aiphoto-f2fb6.firebaseapp.com",
  projectId: "aiphoto-f2fb6",
  storageBucket: "aiphoto-f2fb6.firebasestorage.app",
  messagingSenderId: "22151490134",
  appId: "1:22151490134:web:195faa9408a848125e29f7",
  measurementId: "G-WSD6Y6RL5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
