import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function getSafeApp(): FirebaseApp {
    try {
        if (getApps().length > 0) {
            return getApp();
        }
        return initializeApp(firebaseConfig);
    } catch (error) {
        console.error("Firebase Initialization Failed:", error);
        throw error;
    }
}

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
if (firebaseConfig.apiKey) {
    app = getSafeApp();
    try {
        _auth = getAuth(app);
        _db = getFirestore(app);
    } catch (err) {
        console.warn('Firebase initialization warning:', err);
    }
} else {
    console.warn('Firebase API key is missing. Skipping Firebase initialization.');
}

export const auth: Auth | null = _auth;
export const db: Firestore | null = _db;
