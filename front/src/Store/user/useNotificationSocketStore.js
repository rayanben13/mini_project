import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

const useNotificationSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],

  initializeSocket: (userId) => {
    if (!userId) return;

    if (get().socket) {
      if (get().socket.connected) return;
      get().socket.connect();
      return;
    }

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      set({ isConnected: true });
      socket.emit('join', String(userId));
    });

    socket.on('notification', (data) => {
      set((state) => ({
        notifications: [data, ...state.notifications],
      }));
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) socket.disconnect();
    set({ socket: null, isConnected: false, notifications: [] });
  },
}));

export default useNotificationSocketStore;
