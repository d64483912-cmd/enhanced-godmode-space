import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBi_1lqGI1EVKvhNJtWeMFbEOVrD7IILWU",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "consulting-17de1.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "consulting-17de1",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "consulting-17de1.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "579090407696",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:579090407696:web:3ee95ad14243da259d0595",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6NR5XNHL5B",
};

export const firebase = initializeApp(firebaseConfig, 'godmode');
export const godmode_auth = getAuth(firebase);
