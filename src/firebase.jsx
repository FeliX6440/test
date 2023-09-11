import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0Ved-hKRSNyUHBXWrfepyjIxYuOZAbxU",
  authDomain: "terminium-world-final-ii.firebaseapp.com",
  projectId: "terminium-world-final-ii",
  storageBucket: "terminium-world-final-ii.appspot.com",
  messagingSenderId: "1070649964101",
  appId: "1:1070649964101:web:700571ac998fda82c7552c",
  measurementId: "G-PSD66BZMXE",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
