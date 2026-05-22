import axios from 'axios';
import { create } from 'zustand';
import AuthStore from '../AuthStore.js';

const FILES_API_URL = 'http://localhost:5000/api/files';

const useFilesStore = create((set, get) => ({
  loading: false,

  // دالة مساعدة للحصول على الهيدر مع التوكن
  getAuthHeader: () => {
    const token = AuthStore.getState().token || localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  // إظهار أفضل الملفات للمستخدم
  showTopFilesForUser: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${FILES_API_URL}/showTopFilesForUser?page=${page}&limit=${limit}`, useFilesStore.getState().getAuthHeader());

      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching top files:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // إظهار الملفات التي أعجب بها المستخدم
  fetchFilesLikes: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${FILES_API_URL}/showfilesLikes?page=${page}&limit=${limit}`, useFilesStore.getState().getAuthHeader());
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching liked files:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // إظهار ملفات المستخدم الخاصة
  showMyFiles: async (queryParams = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${FILES_API_URL}/showMyFiles`, {
        ...get().getAuthHeader(),
        params: queryParams,
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching my files:', error);
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
      throw error; // Let react-query handle the error state
    }
  },

  // رفع ملف جديد
  UplodeNewFile: async (fileData) => {
    // fileData should be FormData
    set({ loading: true });
    try {
      const token = AuthStore.getState().token;
      const response = await axios.post(
        `${FILES_API_URL}/UplodeNewFile`,
        fileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Server error',
      };
    }
  },

  // حذف ملف خاص
  deleteMeOwnfile: async (id_file) => {
    set({ loading: true });
    try {
      const response = await axios.delete(
        `${FILES_API_URL}/deleteMeOwnfile/${id_file}`,
        get().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error deleting file:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // الإبلاغ عن ملف
  reportFile: async (id_file, reason, details) => {
    set({ loading: true });
    try {
      const response = await axios.post(
        `${FILES_API_URL}/reportFile/${id_file}`,
        { reason, details },
        get().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error reporting file:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // الإعجاب أو إلغاء الإعجاب بملف
  likeOrDislikeFile: async (id_file, type) => {
    // action: 'LIKE' or 'DISLIKE'
    set({ loading: true });
    try {
      const response = await axios.post(
        `${FILES_API_URL}/likeOrDislikeFile/${id_file}`,
        { type },
        get().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error liking/disliking file:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // حفظ ملف في قائمة دراسية
  saveFileToStudyList: async (id_file, id_study_list) => {
    set({ loading: true });
    try {
      const response = await axios.post(
        `${FILES_API_URL}/saveFileToStudyList/${id_file}/${id_study_list}`,
        {},
        get().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error saving file to study list:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // إظهار ملفات مستخدم معين (عام)
  showFilesUserById: async (id_user, queryParams = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${FILES_API_URL}/showFilesUserById/${id_user}`,
        {
          ...get().getAuthHeader(),
          params: queryParams,
        }
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching user files:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },
}));

export default useFilesStore;
