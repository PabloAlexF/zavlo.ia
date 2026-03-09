import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDju2eSo1peLa-8ayzrFCvh8ZKru4PHBwo",
  authDomain: "zavloia.firebaseapp.com",
  projectId: "zavloia",
  storageBucket: "zavloia.firebasestorage.app",
  messagingSenderId: "1002126921456",
  appId: "1:1002126921456:web:557da6f61c1af3c5b33c35",
  measurementId: "G-JCF2SR1NFC"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
