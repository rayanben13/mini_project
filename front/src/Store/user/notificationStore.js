import axios from 'axios';
import { create } from 'zustand';
import AuthStore from '../AuthStore.js';

const NOTIFICATION_API_URL = 'https://mini-project-1-tcp9.onrender.com/api/notification';

const useNotificationStore = create((set) => ({
  loading: false,

  // دالة مساعدة للحصول على الهيدر مع التوكن
  getAuthHeader: () => {
    const token = AuthStore.getState().token;
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  showMyNotifications: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${NOTIFICATION_API_URL}/showMyNotifications?page=${page}&limit=${limit}`, useNotificationStore.getState().getAuthHeader());
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

  markNotificationAsRead: async (id_notification) => {
    set({ loading: true });
    try {
      const response = await axios.put(`${NOTIFICATION_API_URL}/markNotificationAsRead/${id_notification}`, {}, useNotificationStore.getState().getAuthHeader());
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

  deleteAllMyNotifications: async () => {
    set({ loading: true });
    try {
      const response = await axios.delete(`${NOTIFICATION_API_URL}/deleteAllMyNotifications`, useNotificationStore.getState().getAuthHeader());
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

}));

export default useNotificationStore;
