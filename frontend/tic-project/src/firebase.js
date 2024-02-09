import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAFPlGpbMTa4LNW2AAINAs6ele552NJNG8",
    authDomain: "project-f6242.firebaseapp.com",
    projectId: "project-f6242",
    storageBucket: "project-f6242.appspot.com",
    messagingSenderId: "655535940985",
    appId: "1:655535940985:web:3ff283fcc27dedb436bba8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
