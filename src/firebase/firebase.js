// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHcnswIvOvEamllVmx3aAE-w_oeLr5Mkc",
  authDomain: "to-do-list-e0aef.firebaseapp.com",
  projectId: "to-do-list-e0aef",
  storageBucket: "to-do-list-e0aef.appspot.com",
  messagingSenderId: "113907357190",
  appId: "1:113907357190:web:19a57af3327ea8a6ea5587",
  measurementId: "G-Z01H0JGPSF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app); // Initialize Firestore
const provider = new GoogleAuthProvider();

export { app, db, auth, analytics, storage, provider}; // Export the Firestore instance along with the Firebase app
