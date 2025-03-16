// import module
const Dice = require("./Dice");

class DiceParser {
  static(args) {
    if (args.length < 3)
      throw new Error(
        "At least 3 dice required.\n Example: node index.js 1,2,3 4,5,6 7,8,9"
      );
    return args.map((arg) => {
      const faces = arg.split(",").map((face) => {
        const num = parseInt(face);
        if (isNaN(num)) throw new Error(`Invalid number: ${face}`);
        return num;
      });
      if (faces.length < 1) throw new Error("Dice must have at least 1 face");
      return new Dice(faces);
    });
  }
}

module.exports = DiceParser;