import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDHCtErGf0e4I4R88AhuKpTN1ojXgmYZyQ",
  authDomain: "studio-7270436993-95279.firebaseapp.com",
  projectId: "studio-7270436993-95279",
  storageBucket: "studio-7270436993-95279.appspot.com",
  messagingSenderId: "914242989364",
  appId: "1:914242989364:web:61812196d3ef60fb894961"
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    console.error("Firebase initialization error", error);
}


const getDb = () => db;
const getStorageInstance = () => storage;

export { app, getDb, getStorageInstance as getStorage };
