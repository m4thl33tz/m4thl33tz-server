const { getRandomKey, toNextCard, timer, getProblemSet } = require('./helpers');

const difficulty = require('../../../data/difficulties.json');

const gameRoom = (io, socket) => {


  // On CREATE_ROOM, get a random key, set host, and join room(key)
  socket.on('CREATE_ROOM', ({ nickname }) => {
    const rooms = io.of('/').adapter.rooms;
    
    let roomKey = getRandomKey();

    while(rooms.has(roomKey)) {
      roomKey = getRandomKey();
    }

    // Setup host and join the room
    socket.join(roomKey);
    socket.nickname = nickname;
    socket.isHost = true;

    // Make Player
    const { id: userId } = socket;

    const player = [{ userId, nickname }];

    io.to(roomKey).emit('JOIN_RESULTS', player);
    
    // Send room key
    socket.emit('ROOM_KEY', { roomKey, isHost: true });

    // Default Options
    const room = io.of('/').adapter.rooms.get(roomKey);
    room.gameOptions = {};
  });


  // Join on roomKey, send socket id and nickname to whole room
  socket.on('JOIN_ROOM', ({ roomKey, nickname }) => {
    // Tell Room a new user has joined 
    const { id: userId } = socket;

    socket.join(roomKey);

    socket.nickname = nickname;

    const player = [{ userId, nickname }];

    io.to(roomKey).emit('JOIN_RESULTS', player);

    // Tell new user who is already connected
    const players = [];

    io.sockets.sockets.forEach(socket => {
      if(socket.id !== userId && socket.rooms.has(roomKey)) {
        players.push({ 
          userId: socket.id,
          nickname: socket.nickname
        });
      }
    });

    socket.emit('JOIN_RESULTS', players);
  }); 

  // Emit START_GAME to the entire room
  // Get the problem set and send it 
  socket.on('START_GAME', roomKey => {
    io.to(roomKey).emit('START_GAME_RESULTS', 'START_GAME');
    console.log('Game Starting!');

    const room = io.of('/').adapter.rooms.get(roomKey);

    console.log('Getting problems');

    // Initialize Round Object
    room['ROUND_ONE'] = { players: {} };

    const roundLogic = ({ allowedTime = 30, roundString }) => {
      let elapsed = 0;

      io.to(roomKey).emit(roundString, roundString);

      timer(allowedTime, 
        () => {
          elapsed++;

          const timeLeft = allowedTime - elapsed;
          io.to(roomKey).emit('TIMER', { roomKey, timeLeft });
        },
        () => {
          io.to(roomKey).emit('ROUND_OVER', 'ROUND_OVER');

          toNextCard(
            () => {
              io.to(roomKey).emit('GAME_OVER', 'GAME_OVER');

              toNextCard(
                () => io.to(roomKey).emit('DISPLAY_WINNER', 'DISPLAY_WINNER'), 7);
            }, 5);
        }
      );
    };

    getProblemSet(difficulty[room.difficulty])
      .then(problems => io.to(roomKey).emit('PROBLEM_SET', problems))
      .then(
        toNextCard(() => {
          roundLogic({ allowedTime: 30, roundString: 'ROUND_ONE' });
        }, 5)
      );
  });

  socket.on('UPDATE_SCORE', ({ roomKey, points }) => {
    const { id: userId } = socket;

    // Grab Players
    const room = io.of('/').adapter.rooms.get(roomKey);
    const players = room['ROUND_ONE'].players;

    // Initialize User Object
    if(!players[userId]) players[userId] = { points: 0 };

    // Add received points
    players[userId].points += points;

    io.to(roomKey).emit('UPDATE_SCORE_RESULTS', { userId, points: players[userId].points });
  });

  socket.on('GAME_OPTIONS', ({ difficulty, roomKey }) => {
    const room = io.of('/').adapter.rooms.get(roomKey);

    room.difficulty = difficulty;
    
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
