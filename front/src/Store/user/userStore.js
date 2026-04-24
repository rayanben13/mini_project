import { create } from 'zustand';
import axios from 'axios';
import AuthStore from '../AuthStore.js';

const API_URL = 'http://localhost:5000/api/user';

const useUserStore = create((set) => ({
  loading: false,

  getMyInformation: async () => {
    try {
      set({ loading: true });
      const { token } = AuthStore.getState().user;

      const response = await axios.get(`${API_URL}/MyInformation`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        'Get info error:',
        error.response?.data?.error || error.response?.data?.message
      );

      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },

  // دالة مساعدة للحصول على الهيدر مع التوكن
  getAuthHeader: () => {
    const { token } = AuthStore.getState().user;
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  ShowUserByid: async (id_user) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/ShowUserByid/${id_user}`, useUserStore.getState().getAuthHeader());
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

  addFollow: async (id_user) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_URL}/addFollow/${id_user}`, {}, useUserStore.getState().getAuthHeader());
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

  removeFollow: async (id_user) => {
    set({ loading: true });
    try {
      const response = await axios.delete(`${API_URL}/removeFollow/${id_user}`, useUserStore.getState().getAuthHeader());
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

  UpdateProfile: async (profileData) => {
    // profileData should be FormData since it uses Upload.single('img_user')
    set({ loading: true });
    try {
      const { token } = AuthStore.getState().user;
      const response = await axios.put(`${API_URL}/UpdateProfile`, profileData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

}));

export default useUserStore;
