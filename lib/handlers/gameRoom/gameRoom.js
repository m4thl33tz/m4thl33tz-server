const https = require('https');
const { getRandomKey, toNextCard, timer } = require('./helpers');

const gameRoom = (io, socket) => {


  // On CREATE_ROOM, get a random key, set host, and join room(key)
  socket.on('CREATE_ROOM', data => {
    const rooms = io.of('/').adapter.rooms;
    
    let roomKey = getRandomKey();

    while(rooms.has(roomKey)) {
      roomKey = getRandomKey();
    }

    // Setup host and join the room
    const { nickname } = data;
    socket.nickname = nickname;
    socket.isHost = true;
    socket.join(roomKey);

    // Make Player
    const { id: userId } = socket;

    const player = [{ userId, nickname }];

    io.to(roomKey).emit('JOIN_RESULTS', player);

    // Get Room
    const room = io.of('/').adapter.rooms.get(roomKey);

    // Make Host
    room.host = socket.id;
    
    // Send room key
    socket.emit('ROOM_KEY', { roomKey, isHost: true });
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

  
  // Update others that a new player has joined
  socket.on('UPDATE_PLAYERS', ({ roomKey }) => {
    const players = io.of('/').adapter.rooms.get(roomKey);

    console.log(players);
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


    // Initialize Round Object
    const room = io.of('/').adapter.rooms.get(roomKey);
    room['ROUND_ONE'] = { players: {} };


    let slowAPI = null;

    const roundLogic = ({ allowedTime = 30, roundString }) => {
      let elapsed = 0;

      io.to(roomKey).emit(roundString, roundString);

      timer(allowedTime, 
        () => {
          elapsed++;
          io.to(roomKey).emit('TIMER', allowedTime - elapsed);
        },
        () => {
          io.to(roomKey).emit('ROUND_OVER', 'ROUND_OVER');
          toNextCard(() => io.to(roomKey).emit('GAME_OVER', 'GAME_OVER'), 5);
        }
      );
    };

    https.get(`https://math-problems-staging.herokuapp.com/api/v1/${operand}/${operator}?number=30&difficulty=${difficulty}`, 
      res => {
        res.on('data', data => {
          const parsed = JSON.parse(data);
          io.to(roomKey).emit('PROBLEM_SET', parsed);
          console.log('Problems hath been got');

          if(slowAPI) {
            roundLogic({ allowedTime: 30, roundString: 'ROUND_ONE' });
          }

          slowAPI = false;
        });
      }
    );

    toNextCard(() => {
      if(slowAPI === false) {
        roundLogic({ allowedTime: 30, roundString: 'ROUND_ONE' });
      }

      slowAPI = true;
    }, 5); 
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
