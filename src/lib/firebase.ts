// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHCtErGf0e4I4R88AhuKpTN1ojXgmYZyQ",
  authDomain: "studio-7270436993-95279.firebaseapp.com",
  projectId: "studio-7270436993-95279",
  storageBucket: "studio-7270436993-95279.appspot.com",
  messagingSenderId: "914242989364",
  appId: "1:914242989364:web:61812196d3ef60fb894961"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
