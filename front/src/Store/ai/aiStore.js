import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_CONFIG } from '../../constants/apiConfig';
import { tokenManager } from '../../utils/tokenManager';
import { toast } from 'sonner';

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api/ai`;

const useAiStore = create(
  persist(
    (set, get) => ({
      messages: [],
      loading: false,
      isAiWindowOpen: false,
      activeFileId: null,
      activeDocument: null,
      activationLoading: false,
      hasUnreadResponse: false,

      openAiWindow: (fileId = null) => {
        set({ isAiWindowOpen: true, hasUnreadResponse: false });
        if (fileId) {
          set({ activeFileId: fileId });
        }
      },
      closeAiWindow: () => set({ isAiWindowOpen: false }),
      toggleAiWindow: () => set((state) => ({ isAiWindowOpen: !state.isAiWindowOpen })),
      setActiveFileId: (id) => set({ activeFileId: id }),

      activateLibraryDocument: async (id_file, title) => {
        set({ activationLoading: true });
        try {
          const token = tokenManager.get();
          const response = await axios.post(
            `${API_BASE_URL}/activate/${id_file}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.success) {
            set({
              activeDocument: { type: 'library', id: id_file, title: title },
              activeFileId: id_file,
              isAiWindowOpen: true,
            });
            toast.success(`AI activated for: ${title}`);
          }
          return response.data;
        } catch (error) {
          console.error('activateLibraryDocument error:', error);
          toast.error(error.response?.data?.error || 'Failed to activate document in AI');
          throw error;
        } finally {
          set({ activationLoading: false });
        }
      },

      activateLocalDocument: async (file) => {
        set({ activationLoading: true });
        try {
          const token = tokenManager.get();
          const formData = new FormData();
          formData.append('file', file);
          const response = await axios.post(
            `${API_BASE_URL}/activate-local`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.success) {
            set({
              activeDocument: { type: 'local', name: file.name, file },
              activeFileId: null,
            });
            toast.success(`Local document loaded: ${file.name}`);
          }
          return response.data;
        } catch (error) {
          console.error('activateLocalDocument error:', error);
          toast.error(error.response?.data?.error || 'Failed to load local document');
          throw error;
        } finally {
          set({ activationLoading: false });
        }
      },

      clearActiveDocument: () => {
        set({ activeDocument: null, activeFileId: null });
        toast.info('AI document context cleared');
      },

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

          const isOutsideAiDialog = !get().isAiWindowOpen && typeof window !== 'undefined' && window.location.pathname !== '/dashboard/ai';
          if (isOutsideAiDialog) {
            set({ hasUnreadResponse: true });
          }
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

          const isOutsideAiDialog = !get().isAiWindowOpen && typeof window !== 'undefined' && window.location.pathname !== '/dashboard/ai';
          if (isOutsideAiDialog) {
            set({ hasUnreadResponse: true });
          }
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
