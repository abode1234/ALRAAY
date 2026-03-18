# 🚀 دليل التشغيل السريع

## تم إصلاح المشاكل ✅

### 1. مشكلة Tailwind CSS (`font-almarai`)
**الحل:** تم تحديث `app/globals.css` لاستخدام الصيغة الصحيحة لـ Tailwind CSS 4.x

### 2. مشكلة قاعدة البيانات PostgreSQL
**الحل:** تم إنشاء `docker-compose.yml` وملف `.env` للـ Backend

---

## خطوات التشغيل

### 1️⃣ تشغيل قاعدة البيانات

```bash
# من المجلد الرئيسي Alatian
docker-compose up -d

# تحقق من أنها تعمل
docker-compose ps
```

يجب أن ترى:
```
STATUS: Up X seconds (healthy)
```

### 2️⃣ تشغيل Backend

```bash
cd backend

# إذا كانت هذه المرة الأولى:
# npx prisma migrate deploy

# تشغيل Backend
npm run start:dev
```

Backend سيعمل على: **http://localhost:3000**

انتظر حتى ترى:
```
[Nest] LOG [NestFactory] Starting Nest application...
```

### 3️⃣ تشغيل Frontend

في terminal جديد:

```bash
cd front-end

pnpm run dev
```

Frontend سيعمل على: **http://localhost:3001**

انتظر حتى ترى:
```
✓ Ready in Xms
```

---

## 🎉 جاهز!

افتح المتصفح على:
**http://localhost:3001**

يجب أن ترى:
- ✅ Navbar بالعربية مع dropdown
- ✅ Hero section مع تدرجات لونية برتقالية
- ✅ شريط التصنيفات مع أيقونات
- ✅ المنتجات المميزة (إذا كانت هناك بيانات)
- ✅ Footer متكامل

---

## 🧪 اختبار API

```bash
# جلب المنتجات
curl http://localhost:3000/products

# جلب منتج محدد
curl http://localhost:3000/products/1
```

---

## 🛑 إيقاف التشغيل

```bash
# إيقاف Frontend (Ctrl+C في terminal Frontend)

# إيقاف Backend (Ctrl+C في terminal Backend)

# إيقاف قاعدة البيانات
docker-compose down
```

---

## 📝 ملاحظات

- **Port 3000**: Backend (NestJS)
- **Port 3001**: Frontend (Next.js)
- **Port 5432**: PostgreSQL

إذا كان أي منفذ مستخدم:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

---

## ✨ التصميم

تم بناء Frontend بتصميم مشابه لـ **TechTroniX**:
- 🎨 ألوان برتقالية (#e55a1f)
- 🌙 وضع داكن افتراضي
- 📱 تصميم متجاوب 100%
- 🔤 خطوط عربية (Almarai & Tajawal)
- ✨ تأثيرات بصرية (glow, hover, animations)

Happy Coding! 🚀
