// ===== Configuration Firebase =====
// Projet : Campus Flex

const firebaseConfig = {
  apiKey: "AIzaSyCWKJQ_Cj4mdeGLQKDDEsH8M3QtWKWOLeY",
  authDomain: "campus-flex.firebaseapp.com",
  projectId: "campus-flex",
  storageBucket: "campus-flex.firebasestorage.app",
  messagingSenderId: "279122888771",
  appId: "1:279122888771:web:51a4bcce98c4a7e269acf6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
