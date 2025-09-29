// chat-room.js - VERSIÓN CON REINTENTOS AUTOMÁTICOS
console.log('✅ chat-room.js cargado');

const firebaseConfig = {
    apiKey: "AIzaSyBlhSRpVGn4atwTjPHj854JNdchn7pOQlc",
    authDomain: "blog-estudiantil-3ba42.firebaseapp.com",
    projectId: "blog-estudiantil-3ba42",
    storageBucket: "blog-estudiantil-3ba42.firebasestorage.app",
    messagingSenderId: "262433106333",
    appId: "1:262433106333:web:ee6808d1f6ec529e38e774"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

class ChatRoom {
    constructor() {
        this.roomId = this.getRoomIdFromURL();
        this.currentUser = this.getUserName();
        this.retryCount = 0;
        this.maxRetries = 3;
        
        console.log('🔍 Iniciando chat en sala:', this.roomId);
        
        this.setupEventListeners();
        this.displayRoomInfo();
        this.initializeChat();
    }

    initializeChat() {
        // Primero intentar con el método óptimo
        this.tryOptimizedQuery();
    }

    tryOptimizedQuery() {
        console.log(`🔄 Intento ${this.retryCount + 1} con consulta optimizada...`);
        
        db.collection('messages')
            .where('roomId', '==', this.roomId)
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                console.log('✅ ÍNDICE ACTIVO - Mensajes con filtro:', snapshot.size);
                this.retryCount = 0; // Resetear contador
                this.processMessages(snapshot);
            }, (error) => {
                console.warn(`⚠️ Intento ${this.retryCount + 1} fallido:`, error.code);
                
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    console.log(`⏳ Reintentando en 3 segundos... (${this.retryCount}/${this.maxRetries})`);
                    setTimeout(() => this.tryOptimizedQuery(), 3000);
                } else {
                    console.log('🔄 Cambiando a método alternativo...');
                    this.useAlternativeMethod();
                }
            });
    }

    useAlternativeMethod() {
        console.log('🔄 Usando método alternativo (sin filtro Firebase)');
        
        db.collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                console.log('📨 Todos los mensajes recibidos:', snapshot.size);
                
                const messagesContainer = document.getElementById('messages-container');
                const welcomeMessage = document.querySelector('.welcome-message');
                
                if (welcomeMessage) {
                    welcomeMessage.remove();
                }

                messagesContainer.innerHTML = '';

                // Filtrar manualmente por roomId
                let messageCount = 0;
                const messages = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.roomId === this.roomId) {
                        messages.push(data);
                        messageCount++;
                    }
                });

                // Ordenar por timestamp por si acaso
                messages.sort((a, b) => {
                    const timeA = a.timestamp ? a.timestamp.toDate().getTime() : 0;
                    const timeB = b.timestamp ? b.timestamp.toDate().getTime() : 0;
                    return timeA - timeB;
                });

                // Mostrar mensajes ordenados
                messages.forEach(data => {
                    this.displayMessage(data);
                });

                console.log(`✅ ${messageCount} mensajes mostrados para sala ${this.roomId}`);
                this.scrollToBottom();
                
                // Intentar volver al método óptimo después de 30 segundos
                setTimeout(() => {
                    console.log('🔄 Reintentando método optimizado...');
                    this.retryCount = 0;
                    this.tryOptimizedQuery();
                }, 30000);
            });
    }

    getRoomIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('roomId');
        
        if (!roomId) {
            alert('Sala no válida');
            window.location.href = 'chats.html';
            return;
        }
        
        return roomId;
    }

    getUserName() {
        return localStorage.getItem('chatUserName') || 'Anónimo';
    }

    displayRoomInfo() {
        document.getElementById('room-id-display').textContent = this.roomId;
    }

    setupEventListeners() {
        const sendBtn = document.getElementById('send-btn');
        const messageInput = document.getElementById('message-input');
        const userNameInput = document.getElementById('user-name');
        const leaveBtn = document.getElementById('leave-room');
        const charCount = document.getElementById('char-count');

        userNameInput.value = this.currentUser;

        messageInput.addEventListener('input', () => {
            const count = messageInput.value.length;
            charCount.textContent = `${count}/500 caracteres`;
        });

        sendBtn.addEventListener('click', () => this.sendMessage());
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        userNameInput.addEventListener('change', () => {
            const newName = userNameInput.value.trim() || 'Anónimo';
            localStorage.setItem('chatUserName', newName);
            this.currentUser = newName;
        });

        leaveBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres salir del chat?')) {
                window.location.href = 'chats.html';
            }
        });
    }

    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message) {
            alert('Por favor escribe un mensaje');
            return;
        }

        if (message.length > 500) {
            alert('El mensaje es demasiado largo (máximo 500 caracteres)');
            return;
        }

        try {
            await db.collection('messages').add({
                roomId: this.roomId,
                user: this.currentUser,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            console.log('✅ Mensaje enviado');
            messageInput.value = '';
            document.getElementById('char-count').textContent = '0/500 caracteres';
            
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            alert('Error al enviar el mensaje. Intenta nuevamente.');
        }
    }

    processMessages(snapshot) {
        const messagesContainer = document.getElementById('messages-container');
        const welcomeMessage = document.querySelector('.welcome-message');
        
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        messagesContainer.innerHTML = '';

        snapshot.forEach(doc => {
            const data = doc.data();
            this.displayMessage(data);
        });

        console.log(`✅ ${snapshot.size} mensajes procesados con índice`);
        this.scrollToBottom();
    }

    displayMessage(data) {
        const messagesContainer = document.getElementById('messages-container');
        const messageElement = document.createElement('div');
        
        const isOwnMessage = data.user === this.currentUser;
        const messageClass = isOwnMessage ? 'message own' : 'message other';
        
        const time = data.timestamp ? 
            data.timestamp.toDate().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : 'Ahora';

        messageElement.className = messageClass;
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-user">${this.escapeHtml(data.user)}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.escapeHtml(data.message)}</div>
        `;

        messagesContainer.appendChild(messageElement);
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new ChatRoom();
});