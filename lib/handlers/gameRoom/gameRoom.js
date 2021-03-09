const https = require('https');
const getRandomKey = require('../utils/randomKey');

const gameRoom = (io, socket) => {

  // On CREATE_ROOM, get a random key, set host, and join room(key)
  socket.on('CREATE_ROOM', data => {
    const { nickname } = data;

    const rooms = io.of('/').adapter.rooms;
    
    let randomKey = getRandomKey();

    while(rooms.has(randomKey)) {
      randomKey = getRandomKey();
    }

    socket.nickname = nickname;
    socket.join(randomKey);
    socket.emit('ROOM_KEY', { key: randomKey, isHost: true });
  });

  // Join on key, send socket id and nickname to whole room
  socket.on('JOIN_ROOM', ({ key, nickname }) => {
    socket.join(key);

    const { id } = socket;

    io.to(key).emit('JOIN_RESULTS', { userId: id, nickname });
  }); 

  socket.on('START_GAME', key => {
    io.to(key).emit('START_GAME');

    https.get('https://mathleetz-staging.herokuapp.com/api/v1/arithmetic/addition?number=5', 
      res => {
        res.on('data', data => {
          const parsed = JSON.parse(data);
          io.to(key).emit('PROBLEM_SET', parsed);
        });
      }
    );

    
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
