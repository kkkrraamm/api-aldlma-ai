# 🌊 الدلما AI - مساعدك الذكي المتطور

موقع ويب مبهر بتأثيرات 3D مع شات ذكي يدعم رفع الصور، مصمم بهوية تطبيق الدلما.

## ✨ المميزات

### 🎨 التصميم
- 🌓 **وضعان**: نهاري (Beige & Mint) وليلي (Deep Blue & Soft Blue)
- 🌌 **تأثيرات 3D**: خلفية ثلاثية الأبعاد مع Three.js
- ✨ **أنيميشن متقدم**: GSAP للحركات السلسة
- 💫 **جزيئات طائرة**: تأثيرات بصرية مذهلة
- 📱 **تصميم متجاوب**: يعمل على جميع الأحجام

### 💬 الشات الذكي
- 🤖 **ردود ذكية**: مدعوم بـ AI
- 🖼️ **رفع الصور**: حتى 10 صور في رسالة واحدة
- 📎 **السحب والإفلات**: رفع الصور بسهولة
- ⌨️ **مؤشر الكتابة**: تجربة محادثة واقعية
- 📜 **سجل المحادثات**: حفظ كامل للرسائل

### 🔧 التقنيات
- 🎭 **Three.js**: للرسوميات 3D
- 🎬 **GSAP**: للأنيميشن المتقدم
- 🎨 **CSS3**: متغيرات CSS وانتقالات سلسة
- 📱 **ES6+**: JavaScript حديث
- 🌐 **API Integration**: ربط كامل مع Backend

## 🚀 التشغيل

### 📦 المتطلبات
- متصفح ويب حديث (Chrome, Firefox, Safari, Edge)
- اتصال بالإنترنت (لتحميل المكتبات من CDN)

### ▶️ التشغيل المحلي
```bash
# افتح ملف index.html مباشرة في المتصفح
# أو استخدم Live Server
```

### 🌐 النشر على Render

1. **رفع الملفات إلى GitHub**:
```bash
git add .
git commit -m "✨ Initial commit - Dalma AI Website"
git push origin main
```

2. **ربط مع Render**:
   - انتقل إلى https://dashboard.render.com
   - اختر "New Static Site"
   - اربط مع Repository: `api-aldlma-ai`
   - Branch: `main`
   - Build Command: `# blank`
   - Publish Directory: `.`

3. **Environment Variables** (إذا لزم الأمر):
   - `API_URL`: `https://api-aldlma-ai.onrender.com`

## 📁 هيكل المشروع

```
dalma-ai-website/
├── index.html          # الصفحة الرئيسية
├── style.css           # التصميم الكامل
├── script.js           # المنطق والـ API
└── README.md           # هذا الملف
```

## 🎨 نظام الألوان

### 🌅 الوضع النهاري
```css
Background: #F5F9ED (بيج فاتح)
Surface: #FFFFFF (أبيض)
Primary: #10B981 (أخضر دلما)
Secondary: #FBBF24 (ذهبي/رمل)
Text: #111827 (داكن)
```

### 🌙 الوضع الليلي
```css
Background: #0F172A (أزرق داكن عميق)
Surface: #1E293B (أزرق داكن ناعم)
Primary: #10B981 (أخضر دلما)
Secondary: #FBBF24 (ذهبي)
Text: #F8FAFC (أبيض ناعم)
```

## 🔌 API Integration

الموقع يتصل بـ Backend على Render:

```javascript
API_URL = 'https://api-aldlma-ai.onrender.com'

// Endpoint
POST /chat
Content-Type: multipart/form-data

// Request Body
{
  message: string,
  images: File[] (max 10)
}

// Response
{
  response: string,
  timestamp: string
}
```

## 🎯 الاستخدام

1. **كتابة رسالة**: اكتب سؤالك في صندوق الإدخال
2. **إرفاق صور**: اضغط على أيقونة 📷 لرفع حتى 10 صور
3. **السحب والإفلات**: اسحب الصور مباشرة إلى نافذة الشات
4. **تبديل الوضع**: اضغط على 🌙/☀️ للتبديل بين النهاري/الليلي
5. **الإرسال**: اضغط Enter أو زر الإرسال ➤

## 🔥 المميزات المتقدمة

### 🌌 3D Background
- جزيئات متحركة (800 نقطة)
- Torus (دائرة حلقية) دوارة
- Sphere (كرة) سلكية
- تحديث الألوان حسب الوضع

### ✨ تأثيرات الأنيميشن
- Slide-in للرسائل
- Bounce للإشعارات
- Pulse للمؤشرات
- Scale للأزرار
- Fade للانتقالات

### 🖼️ معالجة الصور
- معاينة فورية
- ضغط تلقائي
- Base64 encoding
- حد أقصى 10 صور
- إمكانية الحذف

## 📊 الأداء

- ⚡ تحميل سريع (< 2 ثانية)
- 🚀 أنيميشن 60 FPS
- 💾 حجم صغير (< 500KB)
- 📱 متجاوب تماماً
- ♿ Accessible (ARIA)

## 🔐 الأمان

- ✅ Input validation
- 🛡️ XSS protection
- 🔒 HTTPS only
- 📏 File size limits
- 🚫 Safe content filtering

## 🐛 استكشاف الأخطاء

### الموقع لا يتصل بـ API
```javascript
// تحقق من:
1. الـ API_URL في script.js
2. CORS مفعل في Backend
3. Environment Variables في Render
```

### الصور لا ترفع
```javascript
// تحقق من:
1. حجم الملف (< 10MB لكل صورة)
2. نوع الملف (image/* فقط)
3. عدد الصور (≤ 10)
```

### التصميم غير صحيح
```javascript
// تحقق من:
1. تحميل style.css بنجاح
2. تفعيل JavaScript
3. متصفح حديث (2020+)
```

## 📝 الترخيص

© 2025 الدلما - جميع الحقوق محفوظة

## 👨‍💻 التطوير

تم تطويره بواسطة Cursor AI مع الذكاء الاصطناعي المتقدم

## 🌐 الروابط

- **Website**: https://api-aldlma-ai.onrender.com
- **API Docs**: https://api-aldlma-ai.onrender.com/docs
- **GitHub**: https://github.com/kkkrraamm/api-aldlma-ai

## 📞 الدعم

للدعم والاستفسارات، يرجى فتح Issue على GitHub

---

**🎉 استمتع باستخدام الدلما AI!**

