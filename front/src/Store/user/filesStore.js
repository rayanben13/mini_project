import { create } from 'zustand';
import axios from 'axios';
import AuthStore from '../AuthStore.js';

const FILES_API_URL = 'http://localhost:5000/api/files';

const useFilesStore = create((set) => ({
  loading: false,

  // دالة مساعدة للحصول على الهيدر مع التوكن
  getAuthHeader: () => {
    const { token } = AuthStore.getState().user;
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  // إظهار أفضل الملفات للمستخدم
  showTopFilesForUser: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${FILES_API_URL}/showTopFilesForUser`,
        useFilesStore.getState().getAuthHeader()
      );

      set({ loading: false });
      return { success: true, data: response.data };
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
  showfilesLikes: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${FILES_API_URL}/showfilesLikes`,
        useFilesStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
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
        ...useFilesStore.getState().getAuthHeader(),
        params: queryParams,
      });
      set({ loading: false });
      return { success: true, data: response.data };
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
        useFilesStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching file details:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // رفع ملف جديد
  UplodeNewFile: async (fileData) => {
    // fileData should be FormData
    set({ loading: true });
    try {
      const { token } = AuthStore.getState().user;
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
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  // حذف ملف خاص
  deleteMeOwnfile: async (id_file) => {
    set({ loading: true });
    try {
      const response = await axios.delete(
        `${FILES_API_URL}/deleteMeOwnfile/${id_file}`,
        useFilesStore.getState().getAuthHeader()
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
  reportFile: async (id_file, reason) => {
    set({ loading: true });
    try {
      const response = await axios.post(
        `${FILES_API_URL}/reportFile/${id_file}`,
        { reason_report: reason },
        useFilesStore.getState().getAuthHeader()
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
  likeOrDislikeFile: async (id_file, action) => {
    // action: 'LIKE' or 'DISLIKE'
    set({ loading: true });
    try {
      const response = await axios.post(
        `${FILES_API_URL}/likeOrDislikeFile/${id_file}`,
        { action },
        useFilesStore.getState().getAuthHeader()
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
        useFilesStore.getState().getAuthHeader()
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
}));

export default useFilesStore;
