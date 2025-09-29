// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBlhSRpVGn4atwTjPHj854JNdchn7pOQlc",
    authDomain: "blog-estudiantil-3ba42.firebaseapp.com",
    projectId: "blog-estudiantil-3ba42",
    storageBucket: "blog-estudiantil-3ba42.firebasestorage.app",
    messagingSenderId: "262433106333",
    appId: "1:262433106333:web:ee6808d1f6ec529e38e774"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase configurado (modular)');

// Exportar para usar en otros módulos
export { app, db };