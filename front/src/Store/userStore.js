import { create } from 'zustand';
import axios from 'axios';
import AuthStore from './AuthStore.js';

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

      return { data: response.data };
    } catch (error) {
      console.error(
        'Get info error:',
        error.response?.data?.error || error.response?.data?.message
      );

      return {
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },
}));

export default useUserStore;
