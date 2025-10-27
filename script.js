// ═══════════════════════════════════════════════════════════
// 🤖 الدلما AI - المنطق الرئيسي
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────── 
// 🌐 API Configuration
// ─────────────────────────────────────────────────────────── 
// استخدم نفس الدومين إذا كان Backend على نفس Render service
const API_URL = window.location.hostname.includes('localhost') 
    ? 'http://localhost:3000' 
    : 'https://dalma-ai-backend.onrender.com'; // رابط Backend الخاص بك

// ─────────────────────────────────────────────────────────── 
// 🎨 State Management
// ─────────────────────────────────────────────────────────── 
const state = {
    theme: localStorage.getItem('theme') || 'light',
    selectedImages: [],
    isProcessing: false
};

// ─────────────────────────────────────────────────────────── 
// 🎯 DOM Elements
// ─────────────────────────────────────────────────────────── 
const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    messages: document.getElementById('messages'),
    chatForm: document.getElementById('chat-form'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    attachBtn: document.getElementById('attach-btn'),
    fileInput: document.getElementById('file-input'),
    imagePreviewContainer: document.getElementById('image-preview-container'),
    imageCount: document.getElementById('image-count'),
    typingIndicator: document.getElementById('typing-indicator'),
    statusText: document.getElementById('status-text'),
    loadingOverlay: document.getElementById('loading-overlay')
};

// ─────────────────────────────────────────────────────────── 
// 🎨 Theme Management
// ─────────────────────────────────────────────────────────── 
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    updateThemeIcon();
    
    // Animate theme toggle
    gsap.from('body', {
        opacity: 0.8,
        duration: 0.3,
        ease: 'power2.inOut'
    });
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ─────────────────────────────────────────────────────────── 
// 🌌 3D Background with Three.js
// ─────────────────────────────────────────────────────────── 
function init3DBackground() {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: state.theme === 'light' ? 0x10B981 : 0x10B981,
        transparent: true,
        opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Create geometric shapes
    const torusGeometry = new THREE.TorusGeometry(1, 0.2, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({
        color: 0x10B981,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 2, -2);
    scene.add(torus);
    
    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xFBBF24,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(3, -1, -3);
    scene.add(sphere);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;
        
        torus.rotation.x += 0.005;
        torus.rotation.y += 0.003;
        
        sphere.rotation.x += 0.003;
        sphere.rotation.y += 0.005;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Update colors on theme change
    const originalToggle = toggleTheme;
    window.toggleTheme = function() {
        originalToggle();
        particlesMaterial.color.setHex(state.theme === 'light' ? 0x10B981 : 0x10B981);
    };
}

// ─────────────────────────────────────────────────────────── 
// ✨ Create Floating Particles
// ─────────────────────────────────────────────────────────── 
function createFloatingParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        particlesContainer.appendChild(particle);
    }
}

// ─────────────────────────────────────────────────────────── 
// 📸 Image Handling
// ─────────────────────────────────────────────────────────── 
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    // Check total count
    if (state.selectedImages.length + files.length > 10) {
        showNotification('لا يمكن رفع أكثر من 10 صور', 'error');
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            showNotification('يرجى اختيار صور فقط', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            state.selectedImages.push({
                file: file,
                dataUrl: e.target.result
            });
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    });
    
    // Reset file input
    event.target.value = '';
}

function updateImagePreview() {
    const container = elements.imagePreviewContainer;
    const count = elements.imageCount;
    
    if (state.selectedImages.length === 0) {
        container.classList.remove('active');
        count.classList.remove('active');
        return;
    }
    
    container.classList.add('active');
    count.classList.add('active');
    count.textContent = state.selectedImages.length;
    
    container.innerHTML = state.selectedImages.map((img, index) => `
        <div class="image-preview">
            <img src="${img.dataUrl}" alt="صورة ${index + 1}">
            <button class="image-preview-remove" onclick="removeImage(${index})" aria-label="حذف">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeImage(index) {
    state.selectedImages.splice(index, 1);
    updateImagePreview();
}

// ─────────────────────────────────────────────────────────── 
// 💬 Message Handling
// ─────────────────────────────────────────────────────────── 
function addMessage(content, isUser = false, images = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    let imagesHtml = '';
    if (images.length > 0) {
        imagesHtml = `
            <div class="message-images">
                ${images.map(img => `<img src="${img}" alt="صورة" class="message-image">`).join('')}
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${isUser ? 'user-avatar' : 'bot-avatar'}">
            <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${formatMessage(content)}</div>
            ${imagesHtml}
        </div>
    `;
    
    elements.messages.appendChild(messageDiv);
    scrollToBottom();
    
    // Animate message
    gsap.from(messageDiv, {
        opacity: 0,
        x: isUser ? 20 : -20,
        duration: 0.4,
        ease: 'power2.out'
    });
}

function formatMessage(text) {
    // Convert markdown-like formatting
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/\n/g, '<br>');
    return text;
}

function scrollToBottom() {
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

function showTypingIndicator() {
    elements.typingIndicator.classList.add('active');
    scrollToBottom();
}

function hideTypingIndicator() {
    elements.typingIndicator.classList.remove('active');
}

// ─────────────────────────────────────────────────────────── 
// 🌐 API Communication
// ─────────────────────────────────────────────────────────── 
async function sendMessageToAPI(message, images = []) {
    try {
        // Prepare FormData for multipart/form-data
        const formData = new FormData();
        formData.append('message', message);
        
        // Add images if any
        images.forEach((img, index) => {
            formData.append('images', img.file);
        });
        
        // Show loading
        showTypingIndicator();
        updateStatus('جاري الإرسال...');
        
        // Log request details
        console.log('📤 [REQUEST] Sending to:', `${API_URL}/chat`);
        console.log('📤 [REQUEST] Message:', message);
        console.log('📤 [REQUEST] Images:', images.length);
        
        // Send request to API
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 [RESPONSE] Status:', response.status);
        console.log('📥 [RESPONSE] OK:', response.ok);
        
        if (!response.ok) {
            // Try to read error message from response
            let errorMessage = `خطأ في الاتصال: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If JSON parsing fails, use status text
                errorMessage = `${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        // Check if response has content
        const text = await response.text();
        if (!text) {
            throw new Error('لم يتم استلام رد من الخادم (empty response)');
        }
        
        // Parse JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('❌ JSON Parse Error:', text);
            throw new Error('خطأ في تحليل رد الخادم: ' + e.message);
        }
        
        // Hide typing indicator
        hideTypingIndicator();
        updateStatus('جاهز');
        
        // Normalize bot reply shape (server may return different keys)
        let botReply = null;
        if (data && typeof data === 'object') {
            botReply = data.response
              ?? data.output_text
              ?? (Array.isArray(data.output) ? (data.output[0]?.content?.[0]?.text || null) : null);
        }
        if (!botReply || typeof botReply !== 'string') {
            // fallback to raw text if available
            botReply = text && typeof text === 'string' ? text : null;
        }
        
        if (botReply) {
            addMessage(botReply, false);
        } else {
            throw new Error('لم يتم استلام رد من الخادم');
        }
        
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        hideTypingIndicator();
        updateStatus('خطأ في الاتصال');
        
        addMessage(`عذراً، حدث خطأ في الاتصال: ${error.message}`, false);
    }
}

// ─────────────────────────────────────────────────────────── 
// 📝 Form Handling
// ─────────────────────────────────────────────────────────── 
async function handleSubmit(event) {
    event.preventDefault();
    
    const message = elements.messageInput.value.trim();
    const images = [...state.selectedImages];
    
    // Validate input
    if (!message && images.length === 0) {
        showNotification('يرجى كتابة رسالة أو إرفاق صور', 'error');
        return;
    }
    
    if (state.isProcessing) {
        return;
    }
    
    state.isProcessing = true;
    elements.sendBtn.disabled = true;
    
    // Add user message
    const imageUrls = images.map(img => img.dataUrl);
    addMessage(message || '(صور مرفقة)', true, imageUrls);
    
    // Clear input
    elements.messageInput.value = '';
    state.selectedImages = [];
    updateImagePreview();
    autoResizeTextarea();
    
    // Send to API
    await sendMessageToAPI(message, images);
    
    state.isProcessing = false;
    elements.sendBtn.disabled = false;
    elements.messageInput.focus();
}

// ─────────────────────────────────────────────────────────── 
// 🎯 Textarea Auto-resize
// ─────────────────────────────────────────────────────────── 
function autoResizeTextarea() {
    const textarea = elements.messageInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

// ─────────────────────────────────────────────────────────── 
// 🔔 Notifications
// ─────────────────────────────────────────────────────────── 
function showNotification(message, type = 'info') {
    updateStatus(message);
    
    // Reset after 3 seconds
    setTimeout(() => {
        updateStatus('جاهز');
    }, 3000);
}

function updateStatus(text) {
    elements.statusText.textContent = text;
    
    // Animate
    gsap.from(elements.statusText, {
        opacity: 0,
        y: -10,
        duration: 0.3
    });
}

// ─────────────────────────────────────────────────────────── 
// ⏳ Loading Overlay
// ─────────────────────────────────────────────────────────── 
function showLoading() {
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
}

// ─────────────────────────────────────────────────────────── 
// 🎮 Event Listeners
// ─────────────────────────────────────────────────────────── 
function initEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Footer - Link to Karmar website
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.addEventListener('click', () => {
            window.open('https://karmar-sa.com', '_blank');
        });
    }
    
    // Form submit
    elements.chatForm.addEventListener('submit', handleSubmit);
    
    // Message input
    elements.messageInput.addEventListener('input', autoResizeTextarea);
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    });
    
    // Attach button
    elements.attachBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    // File input
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop for images
    const chatContainer = document.querySelector('.chat-container');
    
    chatContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        chatContainer.style.borderColor = 'var(--color-primary)';
    });
    
    chatContainer.addEventListener('dragleave', () => {
        chatContainer.style.borderColor = 'rgba(16, 185, 129, 0.2)';
    });
    
    chatContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        chatContainer.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            elements.fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: { files: imageFiles, value: '' } });
        }
    });
}

// ─────────────────────────────────────────────────────────── 
// 🚀 Initialize Application
// ─────────────────────────────────────────────────────────── 
function init() {
    console.log('🌊 الدلما AI - تهيئة التطبيق...');
    
    // Initialize theme
    initTheme();
    
    // Initialize 3D background
    init3DBackground();
    
    // Create floating particles
    createFloatingParticles();
    
    // Initialize event listeners
    initEventListeners();
    
    // Focus on input
    elements.messageInput.focus();
    
    console.log('✅ التطبيق جاهز!');
}

// ─────────────────────────────────────────────────────────── 
// 🎬 Start Application
// ─────────────────────────────────────────────────────────── 
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make removeImage available globally
window.removeImage = removeImage;
window.toggleTheme = toggleTheme;

