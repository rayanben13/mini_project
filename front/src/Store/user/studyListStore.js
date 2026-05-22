import axios from 'axios';
import { create } from 'zustand';
import AuthStore from '../AuthStore.js';

const STUDYLIST_API_URL = 'https://mini-project-44.onrender.com/api/studyList';

const useStudyListStore = create((set) => ({
  loading: false,

  // دالة مساعدة للحصول على الهيدر مع التوكن
  getAuthHeader: () => {
    const token = AuthStore.getState().token;
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  showRecommendedStudyList: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${STUDYLIST_API_URL}/showRecommendedStudyList?page=${page}&limit=${limit}`,
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  showMyStudyList: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${STUDYLIST_API_URL}/showMyStudyList?page=${page}&limit=${limit}`,
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  showAddedStudyList: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${STUDYLIST_API_URL}/showAddedStudyList?page=${page}&limit=${limit}`,
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  showDetailStudyList: async (id_stuList) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${STUDYLIST_API_URL}/showDetailStudyList/${id_stuList}`,
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  createStudyList: async (dataConfig) => {
    // dataConfig: { name_studyList, privat_public }
    set({ loading: true });
    try {
      const response = await axios.post(
        `${STUDYLIST_API_URL}/createStudyList`,
        dataConfig,
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  editStudyList: async (id_stuList, dataConfig) => {
    // dataConfig: { name_studyList, privat_public }
    set({ loading: true });
    try {
      const response = await axios.patch(
        `${STUDYLIST_API_URL}/editStudyList/${id_stuList}`,
        dataConfig,
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  deleteStudyList: async (id_stuList) => {
    set({ loading: true });
    try {
      const response = await axios.delete(
        `${STUDYLIST_API_URL}/deleteStudyList/${id_stuList}`,
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  addStudylistToAddedSection: async (id_stuList) => {
    set({ loading: true });
    try {
      const response = await axios.post(
        `${STUDYLIST_API_URL}/addStudylistToAddedSection/${id_stuList}`,
        {},
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  loveStudyList: async (id_stuList) => {
    try {
      const response = await axios.post(
        `${STUDYLIST_API_URL}/loveStudyList/${id_stuList}`,
        {},
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  addSetReminder: async (id_stuList, date, time) => {
    set({ loading: true });
    try {
      const response = await axios.post(
        `${STUDYLIST_API_URL}/addSetReminder/${id_stuList}`,
        { date, time },
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  deleteFileFromStudyList: async (id_stuList, id_file) => {
    set({ loading: true });
    try {
      const response = await axios.delete(
        `${STUDYLIST_API_URL}/deleteFileFromStudyList/${id_stuList}/${id_file}`,
        useStudyListStore.getState().getAuthHeader()
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },

  showStudyListUserById: async (id_user, queryParams = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${STUDYLIST_API_URL}/showStudyListUserById/${id_user}`,
        {
          params: queryParams,
        }
      );
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.error || 'Server error',
      };
    }
  },
}));

export default useStudyListStore;
