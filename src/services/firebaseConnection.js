
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyAAU1Phmvmqg0THSZys7itVhB-MyrRjj4A",
    authDomain: "tickets-d3756.firebaseapp.com",
    projectId: "tickets-d3756",
    storageBucket: "tickets-d3756.appspot.com",
    messagingSenderId: "321553747906",
    appId: "1:321553747906:web:3de5777457db482f80d05b",
    measurementId: "G-WSL61JQTBX"
  };

  const firebaseapp = initializeApp(firebaseConfig);

  const auth = getAuth(firebaseapp);
  const db = getFirestore(firebaseapp);
  const storage = getStorage(firebaseapp);

  export {auth, db, storage }