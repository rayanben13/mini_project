import axios from "axios";
import { create } from "zustand";

const API_URL = "https://mini-project-44.onrender.com/api/admin/dashboard";

const useDashboardStore = create((set) => ({
  dashboardStatisData: null,
  uploadsGraphData: null,
  topContributors: [],
  loading: false,
  error: null,

  fetchDashboardStatis: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/dashboardStatis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ dashboardStatisData: response.data, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchUploadsOfFilesGraph: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/uplodesOfFilesGraphe`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ uploadsGraphData: response.data.stats || response.data, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchTop10Contributors: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/top10Contributors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ topContributors: response.data.top10 || response.data, loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  }
}));

export default useDashboardStore;
