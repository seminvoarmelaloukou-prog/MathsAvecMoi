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

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);

// Services Firebase
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
