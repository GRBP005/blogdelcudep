// chats.js - VERSIÓN CON FIREBASE COMPAT (sin módulos)
console.log('✅ chats.js cargado');

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBlhSRpVGn4atwTjPHj854JNdchn7pOQlc",
    authDomain: "blog-estudiantil-3ba42.firebaseapp.com",
    projectId: "blog-estudiantil-3ba42",
    storageBucket: "blog-estudiantil-3ba42.firebasestorage.app",
    messagingSenderId: "262433106333",
    appId: "1:262433106333:web:ee6808d1f6ec529e38e774"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado en chats');
    
    const createBtn = document.querySelector('.create-btn');
    const joinBtn = document.querySelector('.join-btn');
    const roomKeyInput = document.getElementById('room-key');
    const roomIdInput = document.getElementById('room-id');
    const joinKeyInput = document.getElementById('join-key');

    console.log('🔍 Botones encontrados:', {
        createBtn: !!createBtn,
        joinBtn: !!joinBtn
    });

    createBtn.addEventListener('click', async function() {
        console.log('🎯 Botón Crear Sala clickeado');
        const roomKey = roomKeyInput.value.trim();
        console.log('🔑 Clave ingresada:', roomKey);
        
        if (!roomKey) {
            alert('Por favor, ingresa una clave para la sala.');
            return;
        }
        
        if (roomKey.length < 4) {
            alert('La clave debe tener al menos 4 caracteres.');
            return;
        }
        
        try {
            const roomId = generateRoomId();
            console.log('🆔 Sala generada:', roomId);
            
            // Crear sala en Firebase
            await db.collection('rooms').add({
                id: roomId,
                password: roomKey,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            console.log('✅ Sala creada en Firebase');
            
            // Redirigir a la sala
            window.location.href = `chat-room.html?roomId=${roomId}`;
            
        } catch (error) {
            console.error('❌ Error creando sala:', error);
            alert('Error al crear la sala. Intenta nuevamente.');
        }
    });

    joinBtn.addEventListener('click', async function() {
        console.log('🎯 Botón Unirse clickeado');
        const roomId = roomIdInput.value.trim().toUpperCase();
        const joinKey = joinKeyInput.value.trim();
        
        console.log('📋 Datos ingresados:', { roomId, joinKey });
        
        if (!roomId || !joinKey) {
            alert('Por favor, completa ambos campos para unirte a la sala.');
            return;
        }
        
        try {
            // Verificar que la sala existe
            const snapshot = await db.collection('rooms')
                .where('id', '==', roomId)
                .get();
            
            if (snapshot.empty) {
                alert('La sala no existe o ha expirado.');
                return;
            }
            
            const roomData = snapshot.docs[0].data();
            
            if (roomData.password !== joinKey) {
                alert('Clave incorrecta para esta sala.');
                return;
            }
            
            // Redirigir a la sala
            window.location.href = `chat-room.html?roomId=${roomId}`;
            
        } catch (error) {
            console.error('❌ Error uniéndose a sala:', error);
            alert('Error al unirse a la sala. Intenta nuevamente.');
        }
    });

    function generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
});