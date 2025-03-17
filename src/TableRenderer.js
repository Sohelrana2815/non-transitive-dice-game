const Table = require("cli-table3");
const chalk = require("chalk");
const ProbabilityCalculator = require("./ProbabilityCalculator");

class TableRenderer {
  static renderProbabilityTable(diceArray) {
    const protocolTable = `
    +---+---------------------------+---------------------+
| # | Computer                  | User                |
+---+---------------------------+---------------------+
| 1 | Generates a random number |                     |
|   | \`x ∈ {0,1,2,3,4,5}\`       |                     |
+---+---------------------------+---------------------+
| 2 | Generates a secret key    |                     |
+---+---------------------------+---------------------+
| 3 | Calculates and displays   |                     |
|   | \`HMAC(key).calculate(x)\`  |                     |
+---+---------------------------+---------------------+
| 4 |                           | Selects a number    |
|   |                           | \`y ∈ {0,1,2,3,4,5}\` |
+---+---------------------------+---------------------+
| 5 | Calculates the result     |                     |
|   | \`(x + y) % 6\`             |                     |
+---+---------------------------+---------------------+
| 6 | Shows both the result     |                     |
|   | and the key               |                     |
+---+---------------------------+---------------------+
    
    `;

    console.log(
      chalk.white(`=== Fair Random Protocol ===
This diagram shows how we ensure fairness:
${protocolTable}

You can verify any step using the disclosed keys!  
Type "?" during verification phase for details.`)
    );

    const matrix = ProbabilityCalculator.computeMatrix(diceArray);
    const table = new Table({
      head: ["User dice▼", ...diceArray.map((d) => d.toString())],
    });

    diceArray.forEach((dice, i) => {
      table.push([dice.toString(), ...matrix[i]]);
    });

    console.log(chalk.blue("\nWinning Probability Matrix:"));
    console.log(table.toString());
  }

  static renderHelpText(diceArray) {
    console.log(
      chalk.green(`
=== Game Help ===
1. Each dice must have 6 faces
2. First move is determined by guessing 0/1
3. Throws use combined random numbers
4. After game ends, you can:
   - Verify HMACs using disclosed keys
   - Check HMAC = SHA3-256(key + number)
    `)
    );
    this.renderProbabilityTable(diceArray);
  }
}

module.exports = TableRenderer;
