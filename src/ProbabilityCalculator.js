class ProbabilityCalculator {
  static winProbability(diceA, diceB) {
    let wins = 0;
    for (const a of diceA.faces) {
      for (const b of diceB.faces) {
        if (a > b) wins++;
      }
    }
    return wins / (diceA.faces.length * diceB.faces.length);
  }

  static computeMatrix(diceArray) {
    const matrix = [];
    for (let i = 0; i < diceArray.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < diceArray.length; j++) {
        if (i === j) {
          matrix[i][j] = '-';
        } else {
          const prob = this.winProbability(diceArray[i], diceArray[j]);
          matrix[i][j] = prob.toFixed(4);
        }
      }
    }
    return matrix;
  }
}

module.exports = ProbabilityCalculator;