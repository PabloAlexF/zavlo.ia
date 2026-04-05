import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};
let app = null;
let dbInstance = null;
let authInstance = null;

function getApp() {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!app) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }
    return app;
}

export function getDbInstance() {
    const firebaseApp = getApp();
    if (!firebaseApp)
        return null;
    if (!dbInstance) {
        dbInstance = getFirestore(firebaseApp);
    }
    return dbInstance;
}

export function getAuthInstance() {
    const firebaseApp = getApp();
    if (!firebaseApp)
        return null;
    if (!authInstance) {
        authInstance = getAuth(firebaseApp);
    }
    return authInstance;
}

export const db = getDbInstance();
export default getApp();
