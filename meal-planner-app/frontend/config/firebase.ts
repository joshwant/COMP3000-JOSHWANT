// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0U4ODVbuLq2UVf21RWeu5QAnMjZkDHdY",
  authDomain: "meal-planner-auth-394cb.firebaseapp.com",
  projectId: "meal-planner-auth-394cb",
  storageBucket: "meal-planner-auth-394cb.firebasestorage.app",
  messagingSenderId: "954280010264",
  appId: "1:954280010264:web:ff44a0681135bb0dd2596d"
};

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default app;