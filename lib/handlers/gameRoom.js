const getRandomKey = require('../utils/randomKey');

const gameRoom = (io, socket) => {

  // On CREATE_ROOM, get a random key, set host, and join room(key)
  socket.on('CREATE_ROOM', data => {
    // const { nickname } = data;

    const rooms = io.of('/').adapter.rooms;
    
    let randomKey = getRandomKey();

    while(rooms.has(randomKey)) {
      randomKey = getRandomKey();
    }

    // socket.nickname = nickname;
    socket.join(randomKey);
    socket.emit('ROOM_KEY', { key: randomKey, isHost: true });
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
