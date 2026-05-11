export const getPdfPreview = (url: string) => {
  if (!url) return "";

  if (url.endsWith('.pdf')) {
    // 2. استبدال الامتداد بـ jpg
    // 3. إضافة بارامترات Cloudinary للتحسين (الجودة التلقائية، العرض، اختيار الصفحة الأولى)
    return url
      .replace(/\.pdf$/, ".jpg") // تحويل لـ JPG
      .replace("/upload/", "/upload/w_500,h_700,c_fill,pg_1,q_auto,f_auto/"); // تحسينات الصورة
  }

  return url;
};