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

module.exports = {
  getRandomKey,
  toNextCard
};
