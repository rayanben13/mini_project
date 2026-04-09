import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const savedToken = localStorage.getItem('token');

const AuthStore = create((set) => ({
  user: {
    token: savedToken || '',
  },

  loading: false,
  statusUser: {
    statusUS: false,
  },

  login: async ({ email, password }) => {
    try {
      set({ loading: true });

      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.accessToken);

      set((state) => ({
        user: {
          token: response.data.accessToken,
        },
        statusUser: { statusUS: true },
      }));

      return { success: true };
    } catch (error) {
      set({
        statusUser: {
          statusUS: false,
        },
      });

      console.error('Login error:', error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },

  signup: async ({ fullname, username, email, password }) => {
    try {
      set({ loading: true });

      const response = await axios.post(`${API_URL}/register`, {
        fullname,
        username,
        email,
        password,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },

  verifyEmail: async ({ email, code }) => {
    try {
      console.log('Verifying email:', email, 'with code:', code);
      set({ loading: true });

      const response = await axios.post(`${API_URL}/verify`, {
        email,
        code,
      });

      localStorage.setItem('token', response.data.accessToken);

      set({
        user: {
          token: response.data.accessToken,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },

  resendVerificationCode: async ({ email }) => {
    try {
      set({ loading: true });

      await axios.post(`${API_URL}/resendVerificationCode`, {
        email,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },

  forgetPassword: async ({ email }) => {
    try {
      set({ loading: true });

      await axios.post(`${API_URL}/forgotPassword`, {
        email,
      });

      return { success: true };
    } catch (error) {
      console.error('Upload error:', error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async ({ email, password, token }) => {
    try {
      set({ loading: true });

      await axios.patch(`${API_URL}/resetPassword/${token}`, {
        email,
        password,
      });

      return { success: true };
    } catch (error) {
      console.error('Upload error:', error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },

  searchMoreInformation: async ({ mode, name, year, major }) => {
    try {
      set({ loading: true });

      const params = { mode, name };
      if (year) params.year = year;
      if (major) params.major = major;

      const response = await axios.get(`${API_URL}/SharchMoreInformation`, {
        params,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        'Search error:',
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

  addedUserInformation: async ({ univ, major, spercialty, academic_year }) => {
    try {
      set({ loading: true });
      const { token } = AuthStore.getState().user;

      const response = await axios.post(
        `${API_URL}/addedUserInformation`,
        { univ, major, spercialty, academic_year },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        'Save info error:',
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

  logout: async () => {
    localStorage.removeItem('token');
    try {
      set({ loading: true });

      await axios.post(`${API_URL}/logout`);

      set({
        user: { id: null, token: '' },
        statusUser: { statusUS: false },
      });
    } catch (error) {
      console.error('Logout error:', error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    } finally {
      set({ loading: false });
    }
  },
}));

export default AuthStore;
