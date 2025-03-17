const Table = require('cli-table3');
const chalk = require('chalk');
const ProbabilityCalculator = require('./ProbabilityCalculator');

class TableRenderer {
  static renderProbabilityTable(diceArray) {
    const matrix = ProbabilityCalculator.computeMatrix(diceArray);
    const table = new Table({
      head: ['Dice ▼', ...diceArray.map(d => d.toString())]
    });

    diceArray.forEach((dice, i) => {
      table.push([dice.toString(), ...matrix[i]]);
    });

    console.log(chalk.blue("\nWinning Probability Matrix:"));
    console.log(table.toString());
  }

  static renderHelpText(diceArray) {
    console.log(chalk.green(`
=== Game Help ===
1. Each dice must have 6 faces
2. First move is determined by guessing 0/1
3. Throws use combined random numbers
4. After game ends, you can:
   - Verify HMACs using disclosed keys
   - Check HMAC = SHA3-256(key + number)
    `));
    this.renderProbabilityTable(diceArray);
  }
}

module.exports = TableRenderer;