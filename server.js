// ═══════════════════════════════════════════════════════════
// 🤖 الدلما AI - Backend Server
// ═══════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────── 
// 🔧 Middleware
// ─────────────────────────────────────────────────────────── 
app.use(cors({
    origin: '*', // السماح لجميع المصادر
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for file uploads (images)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// ─────────────────────────────────────────────────────────── 
// 🏠 Health Check
// ─────────────────────────────────────────────────────────── 
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'الدلما AI Backend',
        version: '1.0.0',
        endpoints: {
            chat: 'POST /chat',
            health: 'GET /'
        }
    });
});

// ─────────────────────────────────────────────────────────── 
// 💬 Chat Endpoint
// ─────────────────────────────────────────────────────────── 
app.post('/chat', upload.array('images', 10), async (req, res) => {
    try {
        const { message, history } = req.body;
        const images = req.files || [];

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 New Chat Request');
        console.log('Message:', message);
        console.log('Images:', images.length);
        console.log('History:', history ? JSON.parse(history).length + ' messages' : 'none');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Validate message
        if (!message && images.length === 0) {
            return res.status(400).json({
                error: 'يرجى إرسال رسالة أو صورة'
            });
        }

        // Parse history
        let chatHistory = [];
        if (history) {
            try {
                chatHistory = JSON.parse(history);
            } catch (e) {
                console.warn('⚠️ Failed to parse history:', e.message);
            }
        }

        // Call OpenAI API if API key is available
        let aiResponse = '';
        
        if (process.env.OPENAI_API_KEY) {
            console.log('✅ OPENAI_API_KEY موجود');
            console.log('📋 PROMPT_ID:', process.env.OPENAI_PROMPT_ID || 'غير موجود');
            console.log('📋 MODEL:', process.env.MODEL || 'default');
            try {
                console.log('🚀 جاري استدعاء OpenAI...');
                aiResponse = await getOpenAIResponse(message, images, chatHistory);
                console.log('✅ تم الحصول على رد من OpenAI بنجاح');
            } catch (error) {
                console.error('❌ AI Engine Error:', error.message);
                console.error('❌ Full Error:', error);
                aiResponse = generateFallbackResponse(message, images);
                console.log('⚠️ استخدام Fallback Response');
            }
        } else {
            console.log('⚠️ OPENAI_API_KEY غير موجود - استخدام Fallback');
            aiResponse = generateFallbackResponse(message, images);
        }

        // Return response
        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

        console.log('✅ Response sent successfully');

    } catch (error) {
        console.error('❌ Chat Error:', error);
        res.status(500).json({
            error: 'حدث خطأ في معالجة طلبك',
            message: error.message
        });
    }
});

// ─────────────────────────────────────────────────────────── 
// 🤖 OpenAI Integration
// ─────────────────────────────────────────────────────────── 
async function getOpenAIResponse(message, images, chatHistory = []) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const MODEL = process.env.MODEL || 'gpt-5';
    const PROMPT_ID = process.env.OPENAI_PROMPT_ID;
    const PROMPT_VERSION = process.env.OPENAI_PROMPT_VERSION || '2';

    console.log('🔧 [DEBUG] Starting getOpenAIResponse');
    console.log('🔧 [DEBUG] Model:', MODEL);
    console.log('🔧 [DEBUG] Message:', message);
    console.log('🔧 [DEBUG] Images count:', images.length);
    console.log('🔧 [DEBUG] History count:', chatHistory.length);
    console.log('🔧 [DEBUG] Using Prompt ID:', PROMPT_ID ? 'YES' : 'NO');

    // بناء تاريخ المحادثة
    const inputMessages = [];
    
    // إذا لم يكن هناك PROMPT_ID نضيف developer prompt داخل input
    if (!PROMPT_ID) {
        inputMessages.push({
            role: 'developer',
            content: [{
                type: 'input_text',
                text: `أنت "الدلما AI" - المساعد الذكي من شركة كارمار بمدينة عرعر (شمال السعودية).

🌊 مهمتك:
- رد باللهجة الشمالية البدوية (أهل عرعر) بشكل لبق وواضح
- حلل الصور بدقة عالية وصفها بالتفصيل
- لا تذكر أبداً أي شركات ذكاء اصطناعي أخرى
- أنت "الدلما AI" فقط من شركة كارمار

💚 الدلما... زرعها طيب، وخيرها باقٍ`
            }]
        });
    }
    
    // إضافة آخر 10 رسائل من التاريخ
    for (const msg of chatHistory.slice(-10)) {
        if (msg.role === 'user') {
            inputMessages.push({
                role: 'user',
                content: [{ type: 'input_text', text: msg.text || '' }]
            });
        } else if (msg.role === 'bot') {
            inputMessages.push({
                role: 'assistant',
                content: [{ type: 'output_text', text: msg.text || '' }]
            });
        }
    }
    
    // الرسالة الجديدة
    const newContent = [];
    if (message) {
        newContent.push({ type: 'input_text', text: message });
    }
    
    // إضافة الصور بالصيغة الصحيحة لـ GPT-5
    for (const image of (images || []).slice(0, 10)) {
        const base64Image = image.buffer.toString('base64');
        newContent.push({
            type: 'input_image',
            image_url: `data:${image.mimetype};base64,${base64Image}`
        });
        console.log('🖼️ [DEBUG] Added image:', image.mimetype);
    }
    
    inputMessages.push({
        role: 'user',
        content: newContent
    });

    // بناء الطلب
    const body = {
        model: MODEL,
        input: inputMessages,
        max_output_tokens: 1500,
        reasoning: { effort: 'medium' }
    };

    // إذا كان PROMPT_ID موجوداً نرسله وفق بنية responses API
    if (PROMPT_ID) {
        body.prompt = { id: PROMPT_ID, version: PROMPT_VERSION };
        body.store = true;
        body.include = [
            'reasoning.encrypted_content',
            'web_search_call.action.sources'
        ];
    }

    console.log('📤 [DEBUG] Request Body:', JSON.stringify(body, null, 2));

    const resp = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(body)
    });

    console.log('📡 [DEBUG] Response Status:', resp.status);

    if (!resp.ok) {
        const errorText = await resp.text();
        console.error('❌ [DEBUG] API Error Response:', errorText);
        throw new Error(`GPT-5 API Error: ${resp.status} - ${errorText}`);
    }

    const data = await resp.json();
    console.log('📥 [DEBUG] Response Data:', JSON.stringify(data, null, 2));
    
    // استخراج النص من الـ output
    if (Array.isArray(data.output)) {
        for (const item of data.output) {
            if (item.type === 'message' && Array.isArray(item.content)) {
                for (const c of item.content) {
                    if (c.type === 'output_text' && c.text) {
                        console.log('✅ [DEBUG] Found output_text:', c.text.substring(0, 100) + '...');
                        return c.text;
                    }
                }
            }
        }
    }
    
    // محاولة بديلة
    if (data.output_text) {
        console.log('✅ [DEBUG] Found direct output_text');
        return data.output_text;
    }
    
    // فشلت جميع المحاولات
    console.error('❌ [DEBUG] فشل استخراج النص من Response');
    console.error('❌ [DEBUG] Full Response:', JSON.stringify(data, null, 2));
    throw new Error('لم يتمكن GPT-5 من معالجة الطلب');
}

// ─────────────────────────────────────────────────────────── 
// 🔄 Fallback Response (if no API key or error)
// ─────────────────────────────────────────────────────────── 

// ─────────────────────────────────────────────────────────── 
// 🔄 Fallback Response (if no OpenAI API)
// ─────────────────────────────────────────────────────────── 
function generateFallbackResponse(message, images) {
    const responses = [
        `هلا والله! 👋\n\nأنا الدلما AI، مساعدك الذكي من أهل عرعر إلى أهلها.\n\n${message ? `سؤالك: "${message}"\n\n` : ''}${images.length > 0 ? `📸 تم استلام ${images.length} صورة.\n\n` : ''}أنا حاضر بخدمتك دايم.\n\nأقدر أساعدك في:\n✨ الإجابة على أسئلتك\n🖼️ تحليل الصور\n💡 تقديم الاقتراحات\n📚 شرح المفاهيم\n\nوش تبيني أركّز عليه؟`,
        
        `أهلاً وسهلاً! 🌊\n\n${message ? `شكراً لرسالتك: "${message}"\n\n` : ''}${images.length > 0 ? `تم استلام ${images.length} صورة 📸\n\n` : ''}أنا الدلما AI، مساعدك الذكي المتطور من شركة كارمار.\n\n💚 الدلما... زرعها طيب، وخيرها باقٍ`,
        
        `مرحباً بك في الدلما AI! 🤖\n\n${message ? `سؤالك الرائع: "${message}"\n\n` : ''}${images.length > 0 ? `🖼️ لقد أرسلت ${images.length} صورة\n\n` : ''}أنا هنا لمساعدتك على طول!\n\n✅ فهم الصور\n✅ تحليل المحتوى\n✅ تقديم إجابات متقدمة\n\n🌊 من أهل عرعر إلى أهلها`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

// ─────────────────────────────────────────────────────────── 
// 🚀 Start Server
// ─────────────────────────────────────────────────────────── 
app.listen(PORT, () => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌊 الدلما AI Backend Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health: http://localhost:${PORT}/`);
    console.log(`💬 Chat: POST http://localhost:${PORT}/chat`);
    console.log('');
    console.log('📊 Status:');
    console.log(`   AI Engine: ${process.env.OPENAI_API_KEY ? '✅ Active' : '⚠️  Not configured'}`);
    console.log(`   Model: ${process.env.MODEL || 'default'}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

