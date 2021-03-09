const https = require('https');
const { getRandomKey, toNextCard } = require('./helpers');

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

    const { id: userId } = socket;

    io.to(key).emit('JOIN_RESULTS', { userId, nickname });
  }); 


  // Emit START_GAME to the entire room
  // Get the problem set and send it 
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

    toNextCard(
      () => {
        io.to(key).emit('ROUND_ONE');
        toNextCard(() => io.to(key).emit('ROUND_OVER'), 30);
      }, 5); 
  });

  // On UPDATE_SCORE, count correct answers, send
  // userId and correctAnswers to entire room
  socket.on('UPDATE_SCORE', ({ problemSet, key }) => {
    const { id: userId } = socket;

    const correctAnswers = problemSet
      .reduce((agg, curr) => {
        if(!curr.isCorrect) return agg;
        return agg + Number(curr.isCorrect);
      }, 0);

    io.to(key).emit('SCORE_RESULTS', { correctAnswers, userId });
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
