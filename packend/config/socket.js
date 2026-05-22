import { Server } from 'socket.io';

export const io = new Server({
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    console.log(`User ${userId} joined`);
    socket.join(userId);
  });
});

// const onlineUsers = new Set();

// io.on('connection', (socket) => {
//   socket.on('join', (userId) => {
//     socket.userId = userId;
//     onlineUsers.add(userId);

//     console.log(`${userId} is online`);
//   });

//   socket.on('disconnect', () => {
//     if (socket.userId) {
//       onlineUsers.delete(socket.userId);
//       console.log(`${socket.userId} is offline`);
//     }
//   });
// });

