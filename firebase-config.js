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

// Initialisation de Firebase une seule fois
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firebase Authentication
const auth = firebase.auth();

// Conserver la connexion localement
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(function(erreur) {
    console.warn("Persistance de la connexion impossible :", erreur);
  });

// Firebase Database
// Disponible uniquement sur les pages qui chargent le SDK Database
const db = firebase.database
  ? firebase.database()
  : null;

// Firebase Storage
// Disponible uniquement sur les pages qui chargent le SDK Storage
const storage = firebase.storage
  ? firebase.storage()
  : null;
