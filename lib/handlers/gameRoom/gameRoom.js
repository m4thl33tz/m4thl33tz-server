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
    socket.isHost = true;
    socket.join(randomKey);
    setTimeout(() => {
      socket.emit('ROOM_KEY', { roomKey: randomKey, isHost: true });
    }, 100);
  });


  // Join on roomKey, send socket id and nickname to whole room
  socket.on('JOIN_ROOM', ({ roomKey, nickname }) => {
    socket.join(roomKey);

    const { id: userId } = socket;

    io.to(roomKey).emit('JOIN_RESULTS', { userId, nickname });
  }); 


  // Emit START_GAME to the entire room
  // Get the problem set and send it 
  socket.on('START_GAME', roomKey => {
    io.to(roomKey).emit('START_GAME_RESULTS', 'START_GAME');
    console.log('Game Starting!');
    // const room = io.of('/').adapter.rooms.get(roomKey);
    // const { gameOptions } = room;
    // const { 
    //   operand = 'arithmetic, 
    //   operation = 'addition',
    //   difficulty = 'easy'
    // } = room;

    const operand = 'arithmetic',
      operator = 'addition',
      difficulty = 'easy';

    console.log('Getting problems');

    https.get(`https://mathleetz-staging.herokuapp.com/api/v1/${operand}/${operator}?number=30&difficulty=${difficulty}`, 
      res => {
        res.on('data', data => {

          console.log('Problems hath been got');

          const parsed = JSON.parse(data);
          io.to(roomKey).emit('PROBLEM_SET', parsed);
        });
      }
    );

    toNextCard(
      () => {
        io.to(roomKey).emit('ROUND_ONE', 'ROUND_ONE');
        toNextCard(() => io.to(roomKey).emit('ROUND_OVER', 'ROUND_OVER'), 30);
      }, 5); 
  });

  // On UPDATE_SCORE, count correct answers, send
  // userId and correctAnswers to entire room
  socket.on('UPDATE_SCORE', ({ problemSet, roomKey }) => {
    const { id: userId } = socket;

    const correctAnswers = problemSet
      .reduce((agg, curr) => {
        if(!curr.isCorrect) return agg;
        return agg + Number(curr.isCorrect);
      }, 0);

    io.to(roomKey).emit('SCORE_RESULTS', { correctAnswers, userId });
  });

  socket.on('GAME_OPTIONS', data => {
    const { roomKey, operand, operator, difficulty } = data;
    const gameOptions = { operand, operator, difficulty };

    // const room = io.of('/').adapter.rooms.get(roomKey);

    // room.gameOptions = gameOptions;
    
    // io.to(roomKey).emit('GAME_OPTIONS_RESULTS', gameOptions);
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
