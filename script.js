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

// ==================== Theme ====================
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'day' ? 'night' : 'day';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
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

