# 🔧 استكشاف الأخطاء - موقع الدلما AI

## ❌ المشكلة: CSS لا يعمل على Render

### 🔍 التشخيص
إذا كان الموقع يعمل محلياً لكن CSS لا يظهر على Render:

### ✅ الحلول

#### 1️⃣ **تحديث Render من GitHub**
1. افتح Render Dashboard: https://dashboard.render.com
2. اختر موقعك
3. اذهب إلى **"Manual Deploy"**
4. اضغط **"Clear build cache & deploy"**

#### 2️⃣ **التحقق من إعدادات Render**
تأكد من الإعدادات التالية:

```
Build Command: (فارغ أو # blank)
Publish Directory: .
Branch: main
```

#### 3️⃣ **استخدام render.yaml**
تم إضافة ملف `render.yaml` للتكوين التلقائي:
- يضمن تحميل CSS بشكل صحيح
- يضبط Content-Type headers
- يفعل الـ caching

#### 4️⃣ **التحقق من المسارات**
تأكد أن الملفات في نفس المستوى:
```
dalma-ai-website/
├── index.html
├── style.css      ← يجب أن يكون هنا
├── script.js      ← يجب أن يكون هنا
└── assets/
    └── img/
```

#### 5️⃣ **مسح الـ Cache**
في المتصفح:
- **Chrome/Edge**: Ctrl+Shift+R (أو Cmd+Shift+R على Mac)
- **Firefox**: Ctrl+F5
- **Safari**: Cmd+Option+R

---

## 🌐 تحديث الموقع بعد التعديلات

إذا عدلت أي ملف:

```bash
cd /Users/kimaalanzi/Desktop/aaldma/dalma-ai-website
git add .
git commit -m "تحديث الموقع"
git push origin main
```

Render سيحدث تلقائياً بعد 1-2 دقيقة!

---

## 🐛 مشاكل شائعة أخرى

### 1. **الصور لا تظهر**
✅ **الحل**: تأكد من مجلد `assets/img/` موجود في GitHub

```bash
git add assets/img/
git commit -m "إضافة الصور"
git push origin main
```

### 2. **Three.js لا يعمل**
✅ **الحل**: تحقق من اتصال الإنترنت (Three.js يحمل من CDN)

### 3. **API لا يستجيب**
✅ **الحل**: تأكد من أن API Backend يعمل:
- https://api-aldlma-ai.onrender.com

إذا كان نائماً (sleeping)، افتحه لإيقاظه.

### 4. **الوضع الليلي لا يحفظ**
✅ **الحل**: هذا طبيعي، يستخدم localStorage محلياً

### 5. **الموقع بطيء في التحميل الأول**
✅ **الحل**: Render Free Plan ينام بعد 15 دقيقة. الزيارة الأولى قد تأخذ 30-60 ثانية.

---

## 📞 للمساعدة الإضافية

### تحقق من Logs في Render:
1. افتح موقعك في Render Dashboard
2. اضغط **"Logs"**
3. ابحث عن أخطاء

### فحص Console في المتصفح:
1. افتح الموقع
2. اضغط F12
3. اذهب إلى **Console**
4. ابحث عن أخطاء حمراء

---

## ✅ التحقق من أن كل شيء يعمل

### على Render:
```
✓ الهيدر يظهر مع الشعار والألوان
✓ الخلفية 3D تتحرك
✓ الجزيئات طائرة
✓ زر تبديل الوضع يعمل
✓ صندوق الشات مصمم بشكل جميل
✓ Footer يظهر مع شعار كارمار
```

### إذا لم يعمل أي شيء:
**احذف الموقع من Render وأعد إنشاءه:**

1. في Render Dashboard، اختر الموقع
2. Settings → Delete Service
3. أنشئ Static Site جديد
4. اربط مع: `kkkrraamm/api-aldlma-ai`
5. Branch: `main`
6. Publish Directory: `.`
7. اضغط Create

---

## 🎯 اختبار سريع

افتح الموقع واختبر:

1. ✅ هل الألوان صحيحة؟ (بيج/أخضر في النهاري)
2. ✅ هل الشعار يظهر؟
3. ✅ هل الخلفية 3D تتحرك؟
4. ✅ هل زر القمر/الشمس يعمل؟
5. ✅ هل Footer يظهر مع "كارمار"؟

إذا كل شيء ✅ = الموقع يعمل بشكل مثالي! 🎉

---

**🌊 الدلما... زرعها طيب، وخيرها باقٍ 💚**

