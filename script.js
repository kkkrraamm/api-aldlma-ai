// ========================================
// Configuration
// ========================================
const CONFIG = {
    API_URL: 'https://dalma-ai-backend.onrender.com/chat',
    MAX_IMAGES: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    STORAGE_KEY: 'dalma_chat_history'
};

// ========================================
// State Management
// ========================================
const state = {
    selectedImages: [],
    isLoading: false,
    currentTheme: localStorage.getItem('theme') || 'day',
    chatHistory: []
};

// ========================================
// DOM Elements
// ========================================
const elements = {
    messagesContainer: document.getElementById('messages'),
    chatContainer: document.getElementById('chat-container'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    imageBtn: document.getElementById('image-btn'),
    fileInput: document.getElementById('file-input'),
    imagePreview: document.getElementById('image-preview'),
    typingIndicator: document.getElementById('typing-indicator'),
    themeToggle: document.getElementById('theme-toggle')
};

// ========================================
// Initialization
// ========================================
function init() {
    console.log('🌊 الدلما AI - تهيئة التطبيق...');
    
    // Initialize theme
    initTheme();
    
    // Load chat history
    loadChatHistory();
    
    // Show welcome if no history
    if (state.chatHistory.length === 0) {
        showWelcomeMessage();
    }
    
    // Event listeners
    setupEventListeners();
    
    // Auto-resize textarea
    autoResizeTextarea();
    
    console.log('✅ التطبيق جاهز!');
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Send message
    elements.sendBtn.addEventListener('click', handleSubmit);
    
    // Enter to send (Shift+Enter for new line)
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    });
    
    // Auto-resize on input
    elements.messageInput.addEventListener('input', autoResizeTextarea);
    
    // Image selection
    elements.imageBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
}

// ========================================
// Theme Management
// ========================================
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    state.currentTheme = state.currentTheme === 'day' ? 'night' : 'day';
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    localStorage.setItem('theme', state.currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.currentTheme === 'day' ? 'fas fa-moon' : 'fas fa-sun';
}

// ========================================
// Chat History Management
// ========================================
function loadChatHistory() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            state.chatHistory = JSON.parse(saved);
            renderChatHistory();
        }
    } catch (error) {
        console.error('خطأ في تحميل المحادثات:', error);
    }
}

function saveChatHistory() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.chatHistory));
    } catch (error) {
        console.error('خطأ في حفظ المحادثات:', error);
    }
}

function renderChatHistory() {
    elements.messagesContainer.innerHTML = '';
    state.chatHistory.forEach(msg => {
        addMessageToDOM(msg.role, msg.content, msg.images, msg.timestamp, false);
    });
    scrollToBottom();
}

function clearWelcomeMessage() {
    const welcome = elements.messagesContainer.querySelector('.welcome-message');
    if (welcome) {
        welcome.remove();
    }
}

// ========================================
// Welcome Message
// ========================================
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <h2>مرحباً بك في الدلما AI</h2>
        <p>كيف يمكنني مساعدتك اليوم؟</p>
    `;
    elements.messagesContainer.appendChild(welcomeDiv);
}

// ========================================
// Message Handling
// ========================================
async function handleSubmit() {
    const message = elements.messageInput.value.trim();
    
    if (!message && state.selectedImages.length === 0) {
        return;
    }
    
    if (state.isLoading) {
        return;
    }
    
    // Clear welcome on first message
    clearWelcomeMessage();
    
    // Add user message
    const userMessage = {
        role: 'user',
        content: message,
        images: [...state.selectedImages],
        timestamp: Date.now()
    };
    
    state.chatHistory.push(userMessage);
    saveChatHistory();
    addMessageToDOM('user', message, state.selectedImages, Date.now());
    
    // Clear input
    elements.messageInput.value = '';
    state.selectedImages = [];
    elements.imagePreview.innerHTML = '';
    autoResizeTextarea();
    
    // Show typing indicator
    showTypingIndicator();
    scrollToBottom();
    
    // Send to API
    try {
        state.isLoading = true;
        elements.sendBtn.disabled = true;
        
        const response = await sendMessageToAPI(message, userMessage.images);
        
        // Add bot response
        const botMessage = {
            role: 'bot',
            content: response,
            images: [],
            timestamp: Date.now()
        };
        
        state.chatHistory.push(botMessage);
        saveChatHistory();
        addMessageToDOM('bot', response, [], Date.now());
        
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        addMessageToDOM('bot', 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', [], Date.now(), true);
    } finally {
        hideTypingIndicator();
        state.isLoading = false;
        elements.sendBtn.disabled = false;
        elements.messageInput.focus();
        scrollToBottom();
    }
}

// ========================================
// API Communication
// ========================================
async function sendMessageToAPI(message, images, retryCount = 0) {
    try {
        const formData = new FormData();
        formData.append('message', message);
        
        // Add images if any
        for (let i = 0; i < images.length; i++) {
            const response = await fetch(images[i]);
            const blob = await response.blob();
            formData.append('images', blob, `image_${i}.jpg`);
        }
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.reply || data.message || 'لا يوجد رد';
        
    } catch (error) {
        console.error(`❌ [API ERROR] Attempt ${retryCount + 1}:`, error);
        
        if (retryCount < CONFIG.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return sendMessageToAPI(message, images, retryCount + 1);
        }
        
        throw error;
    }
}

// ========================================
// DOM Message Rendering
// ========================================
function addMessageToDOM(role, content, images = [], timestamp = Date.now(), isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    // Avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    // Content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    if (isError) {
        contentDiv.classList.add('error-message');
    }
    
    // Text
    if (content) {
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = content;
        contentDiv.appendChild(textDiv);
    }
    
    // Images
    if (images && images.length > 0) {
        const imagesDiv = document.createElement('div');
        imagesDiv.className = 'message-images';
        images.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = 'message-image';
            img.alt = 'صورة';
            img.loading = 'lazy';
            imagesDiv.appendChild(img);
        });
        contentDiv.appendChild(imagesDiv);
    }
    
    // Timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatTime(timestamp);
    contentDiv.appendChild(timeDiv);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// ========================================
// Typing Indicator
// ========================================
function showTypingIndicator() {
    elements.typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator() {
    elements.typingIndicator.style.display = 'none';
}

// ========================================
// Image Handling
// ========================================
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    if (state.selectedImages.length + files.length > CONFIG.MAX_IMAGES) {
        alert(`يمكنك رفع ${CONFIG.MAX_IMAGES} صور كحد أقصى`);
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            state.selectedImages.push(e.target.result);
            renderImagePreview();
        };
        reader.readAsDataURL(file);
    });
    
    // Reset input
    event.target.value = '';
}

function renderImagePreview() {
    elements.imagePreview.innerHTML = '';
    
    state.selectedImages.forEach((imgSrc, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `صورة ${index + 1}`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'preview-remove';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => removeImage(index);
        
        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        elements.imagePreview.appendChild(previewItem);
    });
}

function removeImage(index) {
    state.selectedImages.splice(index, 1);
    renderImagePreview();
}

// ========================================
// Utility Functions
// ========================================
function autoResizeTextarea() {
    const textarea = elements.messageInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ========================================
// Start Application
// ========================================
document.addEventListener('DOMContentLoaded', init);
