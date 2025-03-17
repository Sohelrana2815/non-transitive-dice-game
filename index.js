const DiceParser = require('./src/DiceParser');
const Game = require('./src/Game');
const chalk = require('chalk');

async function main() {
  try {
    const args = process.argv.slice(2);
    const diceArray = DiceParser.parse(args);
    const game = new Game(diceArray);
    await game.run();
  } catch (error) {
    console.log(chalk.red(error.message));
    console.log(chalk.yellow("\nUsage: node index.js <dice1> <dice2> <dice3> ..."));
    console.log(chalk.yellow("Example: node index.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3"));
    process.exit(1);
  }
}

main();