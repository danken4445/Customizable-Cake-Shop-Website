import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaZQSo52iosWrn2jlTFSMxtelVivCVDkU",
  authDomain: "posapplication-36ef9.firebaseapp.com",
  projectId: "posapplication-36ef9",
  storageBucket: "posapplication-36ef9.appspot.com",
  messagingSenderId: "877733134691",
  appId: "1:877733134691:web:ef67eeb61ddb822a1b5356",
  measurementId: "G-BKGGL1F8G9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
