import axios from "axios";
import { create } from "zustand";

const API_URL = "https://mini-project-44.onrender.com/api/admin/filesStatus";

const useFilesStatusStore = create((set, get) => ({
  filesStatusData: null,
  pendingFiles: [],
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,

  fetchFilesStatus: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/filesStatus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ filesStatusData: response.data, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchPendingFiles: async (page = 1, limit = 10, search = "") => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");

      const params = { page, limit };
      if (search) params.search = search;

      const response = await axios.get(`${API_URL}/pendingFiles`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      set({
        pendingFiles: response.data.mappedFiles || [],
        totalPages: response.data.meta.last_page || 1,
        currentPage: response.data.meta.current_page || page,
        loading: false
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  approveRejectFile: async (id_file, status, rejectReason = "") => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");

      const response = await axios.put(`${API_URL}/aproveRejectFiles/${id_file}`, {
        reason: rejectReason
      }, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status }
      });

      return { success: true, message: response.data.message || response.data.succes };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Server error";
      set({ error: message, loading: false });
      return { success: false, message };
    }
  }
}));

export default useFilesStatusStore;
