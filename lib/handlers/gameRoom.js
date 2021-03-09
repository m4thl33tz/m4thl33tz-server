const gameRoom = (io, socket) => {
  socket.on('', data => {

  });
};

module.exports = io => {
  io.on('connection', socket => {
    gameRoom(io, socket);
  });

  io.on('disconnect', socket => {
    console.log('Bye!');
  });
};
