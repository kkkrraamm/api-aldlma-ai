# 🚀 نشر موقع الدلما AI على Render

## ✅ تم الرفع بنجاح!

الكود موجود الآن على GitHub: https://github.com/kkkrraamm/api-aldlma-ai

## 📋 خطوات النشر على Render

### 1️⃣ تسجيل الدخول إلى Render
- انتقل إلى https://dashboard.render.com
- سجل دخول بحسابك

### 2️⃣ إنشاء Static Site جديد
1. اضغط على **"New +"** في الأعلى
2. اختر **"Static Site"**
3. اختر **"Connect a repository"**
4. اختر: `kkkrraamm/api-aldlma-ai`

### 3️⃣ إعدادات النشر
```
Name: dalma-ai-website (أو أي اسم تريده)
Branch: main
Root Directory: (اتركه فارغاً)
Build Command: (اتركه فارغاً)
Publish Directory: .
```

### 4️⃣ Environment Variables (اختياري)
إذا كنت تريد تغيير API URL:
```
Key: API_URL
Value: https://api-aldlma-ai.onrender.com
```

### 5️⃣ انشر الموقع!
- اضغط **"Create Static Site"**
- انتظر 2-3 دقائق للنشر

## 🌐 الرابط النهائي

بعد النشر، ستحصل على رابط مثل:
```
https://dalma-ai-website.onrender.com
```

أو يمكنك ربط Domain مخصص من إعدادات Render.

## 🔧 تحديث الموقع

عند عمل أي تعديل:
```bash
git add .
git commit -m "تحديث الموقع"
git push origin main
```

سيتم تحديث الموقع تلقائياً على Render! 🎉

## ✨ المميزات المنشورة

✅ هيدر مطابق لتطبيق الدلما مع الشعار الأصلي
✅ تأثيرات 3D مبهرة مع Three.js
✅ وضع نهاري/ليلي بألوان التطبيق
✅ شات ذكي مع رفع 10 صور
✅ ربط كامل مع API
✅ Footer مع حقوق شركة كارمار
✅ تصميم متجاوب 100%

## 🐛 استكشاف الأخطاء

### الموقع لا يتصل بـ API؟
1. تأكد من أن API يعمل: https://api-aldlma-ai.onrender.com
2. تحقق من CORS في Backend
3. افتح Console في المتصفح وتحقق من الأخطاء

### الصور لا تظهر؟
1. تأكد من وجود `assets/img/` في GitHub
2. تحقق من مسارات الصور في HTML

### التصميم غير صحيح؟
1. امسح الـ cache (Ctrl+Shift+R)
2. تأكد من تحميل `style.css` و `script.js`

## 📞 الدعم

إذا واجهتك أي مشكلة:
1. تحقق من Logs في Render Dashboard
2. افتح Issues على GitHub
3. راجع ملف README.md

---

**🎉 مبروك! موقع الدلما AI جاهز للعالم!**

🌊 من أهل عرعر إلى أهلها

