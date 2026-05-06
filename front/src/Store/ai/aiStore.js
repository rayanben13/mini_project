import { create } from 'zustand';
import axios from 'axios';
import { API_CONFIG } from '../../constants/apiConfig';
import { tokenManager } from '../../utils/tokenManager';

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api/ai`;

const useAiStore = create((set) => ({
  messages: [],
  loading: false,

  sendAiWithFile: async (message, file, lang = 'en') => {
    set({ loading: true });
    try {
      const token = tokenManager.get();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message', message);

      const response = await axios.post(
        `${API_BASE_URL}/sendAi?lang=${lang}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiResponse = response.data.response;
      set((state) => ({
        messages: [
          ...state.messages,
          { role: 'user', content: message },
          { role: 'ai', content: aiResponse },
        ],
      }));
      return aiResponse;
    } catch (error) {
      console.error('sendAiWithFile error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendAiWithId: async (message, id_file, lang = 'en') => {
    set({ loading: true });
    try {
      const token = tokenManager.get();
      const response = await axios.post(
        `${API_BASE_URL}/sendAi/${id_file}?lang=${lang}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiResponse = response.data.response;
      set((state) => ({
        messages: [
          ...state.messages,
          { role: 'user', content: message },
          { role: 'ai', content: aiResponse },
        ],
      }));
      return aiResponse;
    } catch (error) {
      console.error('sendAiWithId error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearMessages: () => set({ messages: [] }),
}));

export default useAiStore;
