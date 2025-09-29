// blog-firebase.js - AHORA ES MÓDULO
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class BlogFirebase {
    constructor() {
        this.db = db;
        console.log('✅ BlogFirebase inicializado con DB:', this.db);
        this.setupRealTimeUpdates();
    }

    async publicarPost(nickname, contenido) {
        try {
            console.log('📤 Publicando post...');
            
            await addDoc(collection(this.db, 'posts'), {
                nickname: nickname || 'Anónimo',
                contenido: contenido,
                timestamp: serverTimestamp(),
                likes: 0
            });

            console.log('✅ Post publicado en Firebase');
            return true;
        } catch (error) {
            console.error('❌ Error al publicar:', error);
            alert('Error al publicar: ' + error.message);
            return false;
        }
    }

    setupRealTimeUpdates() {
        try {
            console.log('🔄 Configurando actualizaciones en tiempo real...');
            
            const q = query(
                collection(this.db, 'posts'), 
                orderBy('timestamp', 'desc')
            );

            onSnapshot(q, (snapshot) => {
                console.log('📝 Datos recibidos:', snapshot.size, 'posts');
                this.actualizarUI(snapshot);
            }, (error) => {
                console.error('❌ Error en snapshot:', error);
            });

        } catch (error) {
            console.error('❌ Error en actualizaciones tiempo real:', error);
        }
    }

    actualizarUI(snapshot) {
        const postsContainer = document.querySelector('.posts-container');
        
        if (snapshot.empty) {
            postsContainer.innerHTML = '<div class="no-posts">Aún no hay publicaciones. ¡Sé el primero!</div>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const fecha = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : 'Hoy';
            
            html += `
                <div class="post">
                    <div class="post-header">
                        <div class="post-author">${this.escapeHtml(data.nickname)}</div>
                        <div class="post-date">${fecha}</div>
                    </div>
                    <div class="post-content">${this.escapeHtml(data.contenido)}</div>
                </div>
            `;
        });
        
        postsContainer.innerHTML = html;
        console.log('✅ UI actualizada con', snapshot.size, 'posts');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.blogApp = new BlogFirebase();
    console.log('🎯 BlogApp disponible globalmente');
});
