const https = require('https');

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
  difficulty: 'easy'
};

const getProblems = (options = defaultOptions, callback) => {
  const { operator, operand, difficulty } = options;

  const API = 'https://math-problems-staging.herokuapp.com/api/v1';
  const URL = `${API}/${operand}/${operator}?number=30&difficulty=${difficulty}`;

  https.get(URL, callback());
};

module.exports = {
  getRandomKey,
  toNextCard,
  timer,
  getProblems
};
