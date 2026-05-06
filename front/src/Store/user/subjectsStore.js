import axios from 'axios';
import { create } from 'zustand';
import AuthStore from '../AuthStore.js';

const SUBJECTS_API_URL = 'http://localhost:5000/api/subjects';

const useSubjectsStore = create((set, get) => ({
  loading: false,

  // دالة مساعدة للحصول على الهيدر مع التوكن
  getAuthHeader: () => {
    const token = AuthStore.getState().token;
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  yourSubjects: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${SUBJECTS_API_URL}/your-subjects?page=${page}&limit=${limit}`, useSubjectsStore.getState().getAuthHeader());
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

  showDetailSubject: async (id_subject, queryParams = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${SUBJECTS_API_URL}/subject/${id_subject}`, {
        ...get().getAuthHeader(),
        params: queryParams,
      });
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

}));

export default useSubjectsStore;
