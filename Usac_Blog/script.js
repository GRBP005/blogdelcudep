// script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado - Script.js inicializado');
    
    const publishBtn = document.querySelector('.publish-btn');
    const nicknameInput = document.getElementById('nickname');
    const postTextarea = document.querySelector('textarea');
    
    // Esperar a que BlogApp esté listo
    const initApp = setInterval(() => {
        if (window.blogApp) {
            clearInterval(initApp);
            console.log('✅ BlogApp listo, configurando eventos...');
            setupEventListeners();
        }
    }, 100);

    // Timeout de seguridad
    setTimeout(() => {
        if (!window.blogApp) {
            console.warn('⚠️ BlogApp no cargado después de 3 segundos');
            setupBasicFunctionality();
        }
    }, 3000);

    function setupEventListeners() {
        console.log('🎯 Configurando event listeners con Firebase...');
        
        publishBtn.addEventListener('click', async function() {
            await handlePublish();
        });

        // Atajo de teclado
        postTextarea.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                handlePublish();
            }
        });
    }

    async function handlePublish() {
        const nickname = nicknameInput.value.trim();
        const content = postTextarea.value.trim();
        
        console.log('📝 Intentando publicar:', { nickname, content });
        
        if (!content) {
            alert('Por favor, escribe algo antes de publicar.');
            return;
        }
        
        if (content.length > 500) {
            alert('El mensaje es demasiado largo. Máximo 500 caracteres.');
            return;
        }
        
        // Deshabilitar botón mientras se publica
        publishBtn.disabled = true;
        publishBtn.textContent = 'Publicando...';
        
        try {
            const success = await window.blogApp.publicarPost(nickname, content);
            
            if (success) {
                postTextarea.value = '';
                nicknameInput.value = '';
                console.log('✅ Publicación exitosa');
            }
        } catch (error) {
            console.error('❌ Error inesperado:', error);
            alert('Error inesperado: ' + error.message);
        } finally {
            publishBtn.disabled = false;
            publishBtn.textContent = 'Publicar';
        }
    }

    // Función de respaldo
    function setupBasicFunctionality() {
        console.log('🔄 Configurando funcionalidad básica (sin Firebase)...');
        
        publishBtn.addEventListener('click', function() {
            const nickname = nicknameInput.value.trim();
            const content = postTextarea.value.trim();
            
            if (!content) {
                alert('Por favor, escribe algo antes de publicar.');
                return;
            }
            
            const postsContainer = document.querySelector('.posts-container');
            const noPostsMessage = document.querySelector('.no-posts');
            
            if (noPostsMessage) {
                noPostsMessage.remove();
            }
            
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-author">${nickname || 'Anónimo'}</div>
                    <div class="post-date">${new Date().toLocaleDateString()}</div>
                </div>
                <div class="post-content">${content}</div>
               
            `;
            
            postsContainer.insertBefore(postElement, postsContainer.firstChild);
            
            postTextarea.value = '';
            nicknameInput.value = '';
            
            alert('✅ Publicación local creada (Firebase no disponible)');
        });
    }
});
