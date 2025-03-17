const Dice = require("./Dice");
const chalk = require("chalk");

const REQUIRED_FACES = 6; // Each dice must have exactly 6 faces

class DiceParser {
  static parse(args) {
    if (args.length < 3) {
      throw new Error(
        chalk.red(
          "Error: At least 3 dice are required. Example: node index.js 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6"
        )
      );
    }
    return args.map((arg) => {
      const faces = args.split(",").map((face) => {
        const num = parseInt(face, 10);
        if (isNaN(num)) {
          throw new Error(
            chalk.red(
              `Invalid number in dice configuration: "${face}". Please provide integers only.`
            )
          );
        }
        return num;
      });
      if (faces.length !== REQUIRED_FACES) {
        throw new Error(
          chalk.red(
            `Each dice must have exactly ${REQUIRED_FACES} faces. Received: ${faces.length} faces in "${arg}".`
          )
        );
      }
      return new Dice(faces);
    });
  }
}

module.exports = DiceParser;
