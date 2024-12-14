
import { initializeApp, getApps } from 'firebase/app';





// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default app;