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
        const { message } = req.body;
        const images = req.files || [];

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 New Chat Request');
        console.log('Message:', message);
        console.log('Images:', images.length);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Validate message
        if (!message && images.length === 0) {
            return res.status(400).json({
                error: 'يرجى إرسال رسالة أو صورة'
            });
        }

        // Call OpenAI API if API key is available
        let aiResponse = '';
        
        if (process.env.OPENAI_API_KEY) {
            try {
                aiResponse = await getOpenAIResponse(message, images);
            } catch (error) {
                console.error('❌ OpenAI Error:', error.message);
                aiResponse = generateFallbackResponse(message, images);
            }
        } else {
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
async function getOpenAIResponse(message, images) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const MODEL = process.env.MODEL || 'gpt-4o-mini';

    // Prepare messages
    const messages = [
        {
            role: 'system',
            content: `أنت "الدلما AI"، مساعد ذكي ومتطور لمنصة الدلما - منصة مجتمعية من أهل عرعر إلى أهلها.

مهمتك:
- مساعدة المستخدمين بطريقة احترافية وودودة
- الإجابة على الأسئلة بوضوح ودقة
- تحليل الصور إذا تم إرفاقها
- تقديم اقتراحات مفيدة
- استخدام اللغة العربية بشكل أساسي

خصائصك:
✨ ذكي ومتطور
🌊 من أهل عرعر
💚 يساعد المجتمع
📚 يملك معرفة واسعة`
        }
    ];

    // Add user message
    if (images.length > 0) {
        // If images exist, add them with the message
        const content = [
            { type: 'text', text: message || 'ماذا ترى في هذه الصور؟' }
        ];

        // Add images (convert to base64)
        for (const image of images.slice(0, 10)) {
            const base64Image = image.buffer.toString('base64');
            content.push({
                type: 'image_url',
                image_url: {
                    url: `data:${image.mimetype};base64,${base64Image}`
                }
            });
        }

        messages.push({
            role: 'user',
            content: content
        });
    } else {
        messages.push({
            role: 'user',
            content: message
        });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ─────────────────────────────────────────────────────────── 
// 🔄 Fallback Response (if no OpenAI API)
// ─────────────────────────────────────────────────────────── 
function generateFallbackResponse(message, images) {
    const responses = [
        `مرحباً! 👋\n\nأنا الدلما AI، مساعدك الذكي من أهل عرعر إلى أهلها.\n\n${message ? `سؤالك: "${message}"\n\n` : ''}${images.length > 0 ? `📸 تم استلام ${images.length} صورة.\n\n` : ''}للأسف، لا يمكنني معالجة طلبك بشكل كامل حالياً لأن مفتاح OpenAI غير مفعّل.\n\nلكن يمكنني مساعدتك في:\n✨ الإجابة على أسئلتك\n🖼️ تحليل الصور\n💡 تقديم الاقتراحات\n📚 شرح المفاهيم\n\nكيف يمكنني مساعدتك اليوم؟`,
        
        `أهلاً وسهلاً! 🌊\n\n${message ? `شكراً لرسالتك: "${message}"\n\n` : ''}${images.length > 0 ? `تم استلام ${images.length} صورة 📸\n\n` : ''}أنا الدلما AI، مساعدك الذكي المتطور.\n\nحالياً أعمل في الوضع التجريبي. لتفعيل جميع المميزات، يرجى إضافة مفتاح OpenAI API.\n\n💚 الدلما... زرعها طيب، وخيرها باقٍ`,
        
        `مرحباً بك في الدلما AI! 🤖\n\n${message ? `سؤالك الرائع: "${message}"\n\n` : ''}${images.length > 0 ? `🖼️ لقد أرسلت ${images.length} صورة\n\n` : ''}أنا هنا لمساعدتك، لكن للحصول على ردود أكثر تطوراً، يرجى تفعيل OpenAI API في Environment Variables على Render:\n\nOPENAI_API_KEY=your-api-key-here\n\nبعدها سأكون قادراً على:\n✅ فهم الصور\n✅ تحليل المحتوى\n✅ تقديم إجابات متقدمة\n\n🌊 من أهل عرعر إلى أهلها`
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
    console.log(`   OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Active' : '⚠️  Not configured'}`);
    console.log(`   Model: ${process.env.MODEL || 'gpt-4o-mini'}`);
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

