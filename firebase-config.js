// ===== Configuration Firebase =====
// Projet : Campus Flex

const firebaseConfig = {
  apiKey: "AIzaSyCWKJQ_Cj4mdeGLQKDDEsH8M3QtWKWOLeY",
  authDomain: "campus-flex.firebaseapp.com",
  databaseURL: "https://campus-flex-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "campus-flex",
  storageBucket: "campus-flex.firebasestorage.app",
  messagingSenderId: "279122888771",
  appId: "1:279122888771:web:51a4bcce98c4a7e269acf6"
};

// Initialise Firebase une seule fois
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firebase Authentication
const auth = firebase.auth();

// Firebase Realtime Database
const db = firebase.database();

// Firebase Storage : seulement si le SDK Storage est chargé
const storage = (typeof firebase.storage === "function")
  ? firebase.storage()
  : null;
