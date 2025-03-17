const Dice = require('./Dice');
const chalk = require('chalk');

class DiceParser {
  static parse(args) {
    if (args.length === 0) {
      throw new Error(chalk.red("Error: No dice provided. Please provide at least 3 dice."));
    }

    if (args.length < 3) {
      throw new Error(chalk.red(`Error: At least 3 dice are required. You provided only ${args.length} dice.\nExample: node index.js 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6`));
    }

    return args.map((arg, index) => {
      const faces = arg.split(',');

      if (faces.length !== 6) {
        throw new Error(chalk.red(`Error: Each dice must have exactly 6 faces. Dice ${index + 1} has ${faces.length} faces: "${arg}".`));
      }

      const parsedFaces = faces.map(face => {
        const num = parseInt(face, 10);
        if (isNaN(num)) {
          throw new Error(chalk.red(`Error: Invalid number in dice configuration. "${face}" is not a valid integer in dice ${index + 1}: "${arg}".`));
        }
        return num;
      });

      return new Dice(parsedFaces);
    });
  }
}

module.exports = DiceParser;