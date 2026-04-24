import { create } from 'zustand';
import axios from 'axios';
import AuthStore from '../AuthStore.js';

const SEARCH_API_URL = 'http://localhost:5000/api/search';
const FILES_API_URL = 'http://localhost:5000/api/files';

const allActurStore = create((set) => ({
  loading: false,

  // البحث عن الملفات
  getSearchFiles: async (queryParams) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${SEARCH_API_URL}/searchFiles`, {
        params: queryParams,
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // البحث عن المواد (Subjects)
  getSearchSubject: async (queryParams) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${SEARCH_API_URL}/searchSubjects`, {
        params: queryParams,
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw error;
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
      const response = await axios.get(`${FILES_API_URL}/getShareLink/${id_file}`);
      set({ loading: false });
      return response.data; // Example: { link: "http://..." }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

export default allActurStore;
