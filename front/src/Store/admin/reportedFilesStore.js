import { create } from "zustand";
import axios from "axios";

const API_URL = "https://mini-project-44.onrender.com/api/admin/reportedFiles";

const useReportedFilesStore = create((set, get) => ({
  reportedFilesStatusData: null,
  reportedFiles: [],
  reportedDetails: null,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,

  fetchReportedFilesStatus: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/ReportedFilesStatus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ reportedFilesStatusData: response.data, loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchFilesReported: async (page = 1, limit = 10, section = "all") => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/showFilesReported`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, section }
      });
      
      set({ 
        reportedFiles: response.data.data || [], 
        totalPages: response.data.meta.last_page || 1,
        currentPage: response.data.meta.current_page || page,
        loading: false 
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  detailsLoading: false,

  fetchReportedDetails: async (id_file) => {
    try {
      set({ detailsLoading: true, error: null });
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/showReportedDetails/${id_file}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ reportedDetails: response.data.data || response.data, detailsLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, detailsLoading: false });
      return { success: false, message };
    }
  },

  deleteOrIgnoreReportedFile: async (id_file, action, reason = "") => {
    try {
      set({ error: null });
      const token = localStorage.getItem("token");
      
      const body = action === "delete" ? { reason } : {};

      const response = await axios.patch(`${API_URL}/DeleteOrIgnoreReportedFile/${id_file}`, body, {
        headers: { Authorization: `Bearer ${token}` },
        params: { action }
      });
      
      // Update local state to reflect the deletion or ignore
      set((state) => ({
        reportedFiles: state.reportedFiles.filter(item => item.id_file !== id_file),
        reportedDetails: null
      }));

      return { success: true, message: response.data.message || response.data.succes };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  }
}));

export default useReportedFilesStore;
