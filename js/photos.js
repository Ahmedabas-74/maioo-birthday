/* ==========================================================================
   PHOTOS — حط مسار كل صورة بين علامتي التنصيص (فاضي = يفضل الشكل المؤقت)
   مثال:  'frame-hero': 'images/hero.jpg',
   خلي بالك: كل سطر لازم ينتهي بفاصلة , وكل مسار بين علامتي تنصيص ''
   استخدم / وليس \ في المسارات
   ========================================================================== */
const PHOTO_PATHS = {
    // الصورة الكبيرة في أول الموقع
    'frame-hero': 'images/herophoto.jpeg',

    // شريط الفيلم الأفقي (The Little Girl)
    'frame-strip-1': 'images/photo-1.jpeg',
    'frame-strip-2': 'images/photo-5.jpeg',
    'frame-strip-3': 'images/photo-6.jpeg',
    'frame-strip-4': 'images/photo-7.jpeg',

    // قسم Growing Up
    'frame-growing-1': 'images/fav.jpeg',   // البولارويد المايل
    'frame-growing-2': 'images/last.jpeg',   // الصورة الصغيرة جنب الاقتباس
    'frame-growing-3': 'images/photo-4.png',   // الكارت العريض

    // شاشة التلفزيون القديم (بتظهر أبيض وأسود)
    'frame-crt': 'images/fav.jpeg',

    // قسم Today
    'frame-today-oval': 'images/mai.jpeg',  // الصورة البيضاوية
    'frame-today-main': 'images/ee.jpeg',  // الصورة الكبيرة

    // الصورة الدايرية في الآخر
    'frame-ending': 'images/IMG_8242.png'
};

const CRT_VIDEO_PATH = 'videos/memory.mp4';
