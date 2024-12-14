import * as dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';

dotenv.config({ path: '../../.env' });

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

console.log("API Key:", process.env.FIREBASE_API_KEY);
console.log("Auth Domain:", process.env.FIREBASE_AUTH_DOMAIN);
console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default app;