const fetch = require('node-fetch');

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
  let problems = [];

  return Promise.all(
    setOptions.map(option => {
      getProblems(option)
        .then(res => res.json())
        .then(json => {
          problems = [...problems, ...json];
        });
    })
  )
    .then(() => problems);
};

module.exports = {
  getRandomKey,
  toNextCard,
  timer,
  getProblems,
  getProblemSet
};
