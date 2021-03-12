const fetch = require('node-fetch');

const shuffle = array => {
  let currentIndex = array.length, tempValue, randomIndex;

  // Increment down the array.length and
  // switch some elements along the way
  while(currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex --;

    tempValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = tempValue;
  }

  return array;
};

const getRandomKey = () => {
  const alphabet = [
    'A', 'B', 'C', 'D',
    'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X',
    'Y', 'Z'
  ];

  const key = [...Array(4)]
    .map(() => Math.floor(Math.random() * 26))
    .map(index => alphabet[index])
    .join('');

  return key;
};

const toNextCard = (cardHandler, timeInSeconds) => {
  setTimeout(cardHandler, timeInSeconds * 1000);
};

const getCorrectAnswers = problemSet => {
  return problemSet
    .reduce((agg, curr) => {
      if(!curr.isCorrect) return agg;
      return agg + Number(curr.isCorrect);
    }, 0);
};

const timer = (seconds, callback = () => {}, timesUp = () => {}) => {
  const int = setInterval(() => {
    callback();
  }, 1000);

  setTimeout(() => {
    clearInterval(int);
    timesUp();
  }, seconds * 1000);
};

const defaultOptions = {
  operator: 'arithmetic',
  operand: 'addition',
  difficulty: 'easy',
  number: '1'
};

const getProblems = (options = defaultOptions) => {
  const { operator, operand, difficulty, number } = options;

  const API = 'https://math-problems-staging.herokuapp.com/api/v1';
  const URL = `${API}/${operand}/${operator}?number=${number}&difficulty=${difficulty}`;

  return fetch(URL);
};

const getProblemSet = (setOptions) => {
  return Promise.all(
    setOptions.map(option => {
      return getProblems(option)
        .then(res => res.json());
    })
  )
    .then(data => {
      let problems = [];
      data.forEach(datum => problems = [...problems, ...datum]);
      return shuffle(problems);
    });
};

module.exports = {
  getRandomKey,
  toNextCard,
  timer,
  getProblems,
  getProblemSet
};
