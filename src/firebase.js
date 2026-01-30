import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-LuarFozaD8DOE8bFD8KJSHMLFUaXjIQ",
  authDomain: "animal-welfare-app.firebaseapp.com",
  projectId: "animal-welfare-app",
  storageBucket: "animal-welfare-app.appspot.com",
  messagingSenderId: "690483181975",
  appId: "1:690483181975:web:8b06d889e78a930899ecd2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
