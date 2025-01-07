import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCts23ZDkOUx-gIot8N6t6toCb2O5vjaR4",
    authDomain: "myway-6c54f.firebaseapp.com",
    projectId: "myway-6c54f",
    storageBucket: "myway-6c54f.firebasestorage.app",
    messagingSenderId: "613442733167",
    appId: "1:613442733167:web:1f8f3995a561c7ab25f99a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 