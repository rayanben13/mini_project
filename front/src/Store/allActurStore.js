import axios from 'axios';
import { create } from 'zustand';
import AuthStore from './AuthStore.js';

const SEARCH_API_URL = 'http://localhost:5000/api/search';
const FILES_API_URL = 'http://localhost:5000/api/files';
const SUBJECTS_API_URL = 'http://localhost:5000/api/subjects';

const allActurStore = create((set, get) => ({
  loading: false,

  // دالة مساعدة للحصول على الهيدر مع التوكن (اختياري هنا لأنها للجميع ولكن قد تزيد من المعلومات المعروضة للمستخدمين المسجلين)
  getAuthHeader: () => {
    const token = AuthStore.getState().token;
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  // البحث عن الملفات
  getSearchFiles: async (queryParams) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${SEARCH_API_URL}/searchFiles`, {
        ...get().getAuthHeader(),
        params: queryParams,
      });
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error searching files:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // البحث عن المواد (Subjects)
  getSearchSubject: async (queryParams) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${SEARCH_API_URL}/searchSubjects`, {
        ...get().getAuthHeader(),
        params: queryParams,
      });
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error searching subjects:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // تحميل الملفات (يتم فتحه في تبويب جديد لأن الباكاند يقوم بـ Redirect إلى رابط Cloudinary الخاص بالتحميل)
  getDownloadFiles: async (id_file) => {
    if (id_file) {
      window.open(`${FILES_API_URL}/download/${id_file}`, '_blank');
    }
  },

  // جلب رابط المشاركة
  getShareLink: async (id_file) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${FILES_API_URL}/getShareLink/${id_file}`
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error getting share link:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // إظهار تفاصيل المادة مع ملفاتها
  showDetailSubject: async (id_subject, queryParams = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${SUBJECTS_API_URL}/subject/${id_subject}`,
        {
          ...get().getAuthHeader(),
          params: queryParams,
        }
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching subject details:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // إظهار تفاصيل ملف معين
  showDetailFile: async (id_file) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${FILES_API_URL}/showDetailFile/${id_file}`,
        get().getAuthHeader()
      );
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching file details:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },
}));

export default allActurStore;
