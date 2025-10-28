// ==================== Configuration ====================
const API_URL = 'https://dalma-ai-backend.onrender.com/chat';
const MAX_IMAGES = 10;
const STORAGE_KEY = 'dalma_chat';

// ==================== State ====================
let selectedImages = [];
let isLoading = false;
let chatHistory = [];

// ==================== DOM Elements ====================
const elements = {
    scrollContainer: document.querySelector('.scroll-container'),
    messagesContainer: document.getElementById('messagesContainer'),
    messageBox: document.getElementById('messageBox'),
    sendBtn: document.getElementById('sendBtn'),
    attachBtn: document.getElementById('attachBtn'),
    fileInput: document.getElementById('fileInput'),
    imagesPreview: document.getElementById('imagesPreview'),
    typingBox: document.getElementById('typingBox'),
    themeBtn: document.getElementById('themeBtn')
};

// ==================== Initialize ====================
function init() {
    console.log('🌊 الدلما AI - جاري التحميل...');
    
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'day';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Initialize 3D Background
    init3DBackground();
    
    // Load chat history
    loadHistory();
    
    // Event listeners
    elements.sendBtn.addEventListener('click', handleSend);
    elements.messageBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    elements.messageBox.addEventListener('input', autoResize);
    elements.attachBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFiles);
    elements.themeBtn.addEventListener('click', toggleTheme);
    
    console.log('✅ جاهز!');
}

// ==================== 3D Background - SPECTACULAR ==================== 
function init3DBackground() {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 8;
    
    // Get theme colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'night';
    const primaryColor = new THREE.Color(0x10B981);
    const secondaryColor = new THREE.Color(isDark ? 0x0F172A : 0xFEF3E2);
    const accentColor = new THREE.Color(0xFBBF24);
    
    // 🌟 1. MASSIVE PARTICLE SYSTEM (2000 particles)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const sizesArray = new Float32Array(particlesCount);
    
    for(let i = 0; i < particlesCount; i++) {
        // Position
        posArray[i * 3] = (Math.random() - 0.5) * 25;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 25;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 20;
        
        // Colors (mix of green and gold)
        const colorChoice = Math.random();
        if(colorChoice > 0.7) {
            colorsArray[i * 3] = accentColor.r;
            colorsArray[i * 3 + 1] = accentColor.g;
            colorsArray[i * 3 + 2] = accentColor.b;
        } else {
            colorsArray[i * 3] = primaryColor.r;
            colorsArray[i * 3 + 1] = primaryColor.g;
            colorsArray[i * 3 + 2] = primaryColor.b;
        }
        
        // Sizes
        sizesArray[i] = Math.random() * 0.05;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // 🌊 2. DALMA WAVES (Multiple rotating toruses)
    const waves = [];
    for(let i = 0; i < 5; i++) {
        const geometry = new THREE.TorusGeometry(3 + i * 1, 0.03, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? primaryColor : accentColor,
            transparent: true,
            opacity: 0.4 - i * 0.05,
            wireframe: true
        });
        const wave = new THREE.Mesh(geometry, material);
        wave.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        wave.position.z = -5 - i * 1.5;
        scene.add(wave);
        waves.push(wave);
        
        // GSAP animation for waves
        gsap.to(wave.rotation, {
            z: Math.PI * 2,
            duration: 20 + i * 5,
            repeat: -1,
            ease: "none"
        });
    }
    
    // 🔮 3. FLOATING GEOMETRIC SHAPES
    const geometries = [];
    const shapes = [
        new THREE.IcosahedronGeometry(0.3, 0),
        new THREE.OctahedronGeometry(0.25, 0),
        new THREE.TetrahedronGeometry(0.3, 0),
        new THREE.TorusKnotGeometry(0.2, 0.08, 64, 8)
    ];
    
    for(let i = 0; i < 8; i++) {
        const geometry = shapes[Math.floor(Math.random() * shapes.length)];
        const material = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? primaryColor : accentColor,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 8
        );
        scene.add(mesh);
        geometries.push(mesh);
        
        // GSAP animation for each shape
        gsap.to(mesh.rotation, {
            x: Math.PI * 2,
            y: Math.PI * 2,
            duration: 15 + Math.random() * 10,
            repeat: -1,
            ease: "none"
        });
        
        gsap.to(mesh.position, {
            y: mesh.position.y + (Math.random() - 0.5) * 5,
            duration: 8 + Math.random() * 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
    
    // 💫 4. GLOWING ENERGY SPHERES
    const energySpheres = [];
    for(let i = 0; i < 3; i++) {
        const geometry = new THREE.SphereGeometry(0.5 + i * 0.2, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: primaryColor,
            transparent: true,
            opacity: 0.2,
            wireframe: false
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            -3 - i * 2
        );
        scene.add(sphere);
        energySpheres.push(sphere);
        
        // Pulsing animation
        gsap.to(sphere.scale, {
            x: 1.5,
            y: 1.5,
            z: 1.5,
            duration: 2 + i,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
    
    // 🌈 5. LIGHT RAYS
    const lightRays = [];
    for(let i = 0; i < 12; i++) {
        const geometry = new THREE.CylinderGeometry(0.01, 0.01, 20, 8);
        const material = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? primaryColor : accentColor,
            transparent: true,
            opacity: 0.15
        });
        const ray = new THREE.Mesh(geometry, material);
        const angle = (i / 12) * Math.PI * 2;
        ray.position.set(Math.cos(angle) * 8, Math.sin(angle) * 8, -10);
        ray.lookAt(0, 0, 0);
        scene.add(ray);
        lightRays.push(ray);
    }
    
    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.001;
        
        // Rotate particles in 3D space
        particlesMesh.rotation.y = time * 0.15;
        particlesMesh.rotation.x = Math.sin(time) * 0.05;
        
        // Animate light rays
        lightRays.forEach((ray, i) => {
            ray.rotation.z = time * (0.2 + i * 0.02);
        });
        
        // Camera gentle movement
        camera.position.x = Math.sin(time * 0.3) * 0.5;
        camera.position.y = Math.cos(time * 0.2) * 0.3;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Update colors on theme change
    window.addEventListener('themeChanged', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'night';
        // Animate color transitions with GSAP
        gsap.to(primaryColor, {
            r: 0x10 / 255,
            g: 0xB9 / 255,
            b: 0x81 / 255,
            duration: 1,
            onUpdate: () => {
                waves.forEach((wave, i) => {
                    if(i % 2 === 0) wave.material.color.copy(primaryColor);
                });
                geometries.forEach((geo, i) => {
                    if(i % 2 === 0) geo.material.color.copy(primaryColor);
                });
            }
        });
    });
}

// ==================== Theme ====================
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'day' ? 'night' : 'day';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Trigger theme change event for 3D background
    window.dispatchEvent(new Event('themeChanged'));
}

function updateThemeIcon(theme) {
    const icon = elements.themeBtn.querySelector('i');
    icon.className = theme === 'day' ? 'fas fa-moon' : 'fas fa-sun';
}

// ==================== Chat History ====================
function loadHistory() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            chatHistory = JSON.parse(saved);
            renderHistory();
        }
    } catch (error) {
        console.error('خطأ في تحميل المحادثات:', error);
    }
}

function saveHistory() {
    try {
        // حفظ المحادثات بدون الصور (لتوفير المساحة)
        const historyWithoutImages = chatHistory.map(msg => ({
            role: msg.role,
            text: msg.text,
            time: msg.time
            // لا نحفظ images لتوفير مساحة localStorage
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historyWithoutImages));
    } catch (error) {
        console.error('خطأ في حفظ المحادثات:', error);
        // إذا امتلأت المساحة، احذف أقدم 50% من المحادثات
        if (error.name === 'QuotaExceededError') {
            chatHistory = chatHistory.slice(Math.floor(chatHistory.length / 2));
            saveHistory(); // حاول مرة أخرى
        }
    }
}

function renderHistory() {
    // Remove welcome message
    const welcome = elements.messagesContainer.querySelector('.welcome-box');
    if (welcome) welcome.remove();
    
    // Clear container
    elements.messagesContainer.innerHTML = '';
    
    // Render all messages
    chatHistory.forEach(msg => {
        addMessageDOM(msg.role, msg.text, msg.images, msg.time, false);
    });
    
    scrollToBottom();
}

// ==================== Send Message ====================
async function handleSend() {
    const text = elements.messageBox.value.trim();
    
    if (!text && selectedImages.length === 0) return;
    if (isLoading) return;
    
    // Remove welcome on first message
    const welcome = elements.messagesContainer.querySelector('.welcome-box');
    if (welcome) welcome.remove();
    
    // Add user message
    const userMsg = {
        role: 'user',
        text: text,
        images: [...selectedImages],
        time: Date.now()
    };
    
    chatHistory.push(userMsg);
    saveHistory();
    addMessageDOM('user', text, selectedImages, Date.now());
    
    // Clear input
    elements.messageBox.value = '';
    selectedImages = [];
    elements.imagesPreview.innerHTML = '';
    autoResize();
    
    // Show typing
    showTyping();
    
    // Send to API
    try {
        isLoading = true;
        elements.sendBtn.disabled = true;
        
        const reply = await sendToAPI(text, userMsg.images);
        
        // Add bot reply
        const botMsg = {
            role: 'bot',
            text: reply,
            images: [],
            time: Date.now()
        };
        
        chatHistory.push(botMsg);
        saveHistory();
        addMessageDOM('bot', reply, [], Date.now());
        
    } catch (error) {
        console.error('خطأ:', error);
        addMessageDOM('bot', 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', [], Date.now(), true);
    } finally {
        hideTyping();
        isLoading = false;
        elements.sendBtn.disabled = false;
        elements.messageBox.focus();
    }
}

// ==================== API Call ====================
async function sendToAPI(message, images) {
    const formData = new FormData();
    formData.append('message', message);
    
    // Add chat history (last 10 messages)
    const historyToSend = chatHistory.slice(-10).map(msg => ({
        role: msg.role,
        text: msg.text
    }));
    formData.append('history', JSON.stringify(historyToSend));
    
    // Add images
    for (let i = 0; i < images.length; i++) {
        const response = await fetch(images[i]);
        const blob = await response.blob();
        formData.append('images', blob, `img_${i}.jpg`);
    }
    
    const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.response || data.reply || data.message || 'لا يوجد رد';
}

// ==================== Add Message to DOM ====================
function addMessageDOM(role, text, images = [], time = Date.now(), isError = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    if (isError) msgDiv.classList.add('error-msg');
    
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    // Bubble
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    
    // Text
    if (text) {
        const textDiv = document.createElement('div');
        textDiv.className = 'msg-text';
        textDiv.textContent = text;
        bubble.appendChild(textDiv);
    }
    
    // Images
    if (images && images.length > 0) {
        const imgsDiv = document.createElement('div');
        imgsDiv.className = 'msg-images';
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'صورة';
            img.loading = 'lazy';
            imgsDiv.appendChild(img);
        });
        bubble.appendChild(imgsDiv);
    }
    
    // Time
    const timeDiv = document.createElement('div');
    timeDiv.className = 'msg-time';
    timeDiv.textContent = formatTime(time);
    bubble.appendChild(timeDiv);
    
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    elements.messagesContainer.appendChild(msgDiv);
    
    scrollToBottom();
}

// ==================== Typing Indicator ====================
function showTyping() {
    elements.typingBox.style.display = 'flex';
    scrollToBottom();
}

function hideTyping() {
    elements.typingBox.style.display = 'none';
}

// ==================== File Handling ====================
function handleFiles(e) {
    const files = Array.from(e.target.files);
    
    if (selectedImages.length + files.length > MAX_IMAGES) {
        alert(`يمكنك رفع ${MAX_IMAGES} صور كحد أقصى`);
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            selectedImages.push(ev.target.result);
            renderPreview();
        };
        reader.readAsDataURL(file);
    });
    
    e.target.value = '';
}

function renderPreview() {
    elements.imagesPreview.innerHTML = '';
    
    selectedImages.forEach((src, idx) => {
        const div = document.createElement('div');
        div.className = 'preview-img';
        
        const img = document.createElement('img');
        img.src = src;
        
        const btn = document.createElement('button');
        btn.className = 'remove-img';
        btn.innerHTML = '<i class="fas fa-times"></i>';
        btn.onclick = () => removeImage(idx);
        
        div.appendChild(img);
        div.appendChild(btn);
        elements.imagesPreview.appendChild(div);
    });
}

function removeImage(idx) {
    selectedImages.splice(idx, 1);
    renderPreview();
}

// ==================== Utilities ====================
function autoResize() {
    const box = elements.messageBox;
    box.style.height = 'auto';
    box.style.height = Math.min(box.scrollHeight, 180) + 'px';
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        elements.scrollContainer.scrollTop = elements.scrollContainer.scrollHeight;
    });
}

function formatTime(timestamp) {
    const d = new Date(timestamp);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

// ==================== Start ====================
document.addEventListener('DOMContentLoaded', init);

