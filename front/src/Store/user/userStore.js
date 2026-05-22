import axios from 'axios';
import { create } from 'zustand';
import AuthStore from '../AuthStore.js';

const API_URL = 'http://localhost:5000/api/user';

const useUserStore = create((set, get) => ({
  loading: false,
  userInfo: null,     // 1. تخزين البيانات
  cacheExpiry: 0,     // 2. وقت انتهاء صلاحية الكاش

  // userStore.js
  getMyInformation: async (isDropdown = false) => {
    try {
      const { token } = AuthStore.getState();

      // إرسال الـ Query Parameter في الرابط
      const response = await axios.get(`${API_URL}/MyInformation?ProfileDropdown=${isDropdown}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      throw error; // ارمِ الخطأ ليتعامل معه React Query
    }
  },

  // دالة مساعدة للحصول على الهيدر مع التوكن
  getAuthHeader: () => {
    const { token } = AuthStore.getState();
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  ShowUserByid: async (id_user) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/ShowUserByid/${id_user}`, useUserStore.getState().getAuthHeader());
      console.log("response", response);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

  addFollow: async (id_user) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_URL}/addFollow/${id_user}`, {}, useUserStore.getState().getAuthHeader());
      console.log("add follow", response);
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
      console.log("remove follow", response);

      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.error || 'Server error' };
    }
  },

  UpdateProfile: async (profileData) => {
    console.log("profileData", profileData)
    // profileData should be FormData since it uses Upload.single('img_user')
    set({ loading: true });
    try {
      const { token } = AuthStore.getState();
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
