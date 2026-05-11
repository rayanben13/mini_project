import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_CONFIG } from '../../constants/apiConfig';
import { tokenManager } from '../../utils/tokenManager';

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api/ai`;

const useAiStore = create(
  persist(
    (set, get) => ({
      messages: [],
      loading: false,
      isAiWindowOpen: false,
      activeFileId: null,

      openAiWindow: (fileId = null) => {
        set({ isAiWindowOpen: true });
        if (fileId) {
          set({ activeFileId: fileId });
        }
      },
      closeAiWindow: () => set({ isAiWindowOpen: false }),
      toggleAiWindow: () => set((state) => ({ isAiWindowOpen: !state.isAiWindowOpen })),
      setActiveFileId: (id) => set({ activeFileId: id }),

      sendAiWithFile: async (message, file, lang = 'en') => {
        set({ loading: true });
        try {
          const token = tokenManager.get();
          const formData = new FormData();
          if (file && file.size > 0) {
            formData.append('file', file);
          }
          formData.append('message', message);
          formData.append('history', JSON.stringify(get().messages));

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

          const aiResponse = response.data.message || response.data.response;
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
            { message, history: get().messages },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const aiResponse = response.data.message || response.data.response;
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
    }),
    {
      name: 'ai-chat-history', // name of the item in the storage (must be unique)
      partialize: (state) => ({ messages: state.messages }), // Only persist messages
    }
  )
);

export default useAiStore;
