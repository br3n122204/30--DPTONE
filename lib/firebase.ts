import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC39P1ozcNetx3x92S4E5d7VuF-110B4c0",
  authDomain: "clothing-website-6c9a7.firebaseapp.com",
  projectId: "clothing-website-6c9a7",
  storageBucket: "clothing-website-6c9a7.firebasestorage.app",
  messagingSenderId: "418353291258",
  appId: "1:418353291258:web:4042ce495230cdb2ec4e43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth }; 