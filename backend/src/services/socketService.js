const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true }
  });

  io.on('connection', (socket) => {
    socket.on('subscribe:repo', ({ repoFullName }) => {
      socket.join(`repo:${repoFullName}`);
    });
    socket.on('subscribe:course', ({ courseId }) => {
      socket.join(`course:${courseId}`);
    });
  });
}

function emit(room, event, data) {
  if (!io) return;
  io.to(room).emit(event, { ...data, timestamp: new Date().toISOString() });
}

module.exports = { initSocket, emit };
