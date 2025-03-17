// game.js
const crypto = require('crypto');
const readline = require('readline');
const Table = require('cli-table3');

/**
 * Dice: represents a dice with arbitrary faces.
 */
class Dice {
  constructor(faces) {
    this.faces = faces;
  }
  roll(index) {
    return this.faces[index];
  }
  toString() {
    return `[${this.faces.join(",")}]`;
  }
}

/**
 * DiceParser: parses command‑line arguments into an array of Dice.
 */
class DiceParser {
  static parse(args) {
    if (args.length < 3) {
      throw new Error("At least 3 dice required.\nExample: node game.js 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6");
    }
    return args.map(arg => {
      const faces = arg.split(",").map(face => {
        const num = parseInt(face, 10);
        if (isNaN(num)) throw new Error(`Invalid number: ${face}`);
        return num;
      });
      if (faces.length < 1) throw new Error("Dice must have at least 1 face");
      return new Dice(faces);
    });
  }
}

/**
 * FairRandom: implements the fair random generation protocol.
 * It generates a secret key (256 bits), a random integer in a given range,
 * and calculates the HMAC (using SHA3-256) of that number with the key.
 */
class FairRandom {
  static generate(range) {
    const keyBuffer = crypto.randomBytes(32); // 256 bits
    const number = FairRandom.secureRandomInt(range);
    const hmac = FairRandom.calculateHMAC(keyBuffer, number);
    return { number, key: keyBuffer.toString('hex').toUpperCase(), hmac };
  }
  
  // Generates a random integer in the range [0, range-1] using rejection sampling.
  static secureRandomInt(range) {
    const max = Math.floor(256 / range) * range;
    let randomNumber;
    do {
      const buf = crypto.randomBytes(1);
      randomNumber = buf.readUInt8(0);
    } while (randomNumber >= max);
    return randomNumber % range;
  }
  
  // Calculates HMAC using SHA3-256.
  static calculateHMAC(keyBuffer, number) {
    const hmac = crypto.createHmac('sha3-256', keyBuffer);
    hmac.update(number.toString());
    return hmac.digest('hex').toUpperCase();
  }
}

/**
 * ProbabilityCalculator: calculates win probabilities for each pair of dice.
 */
class ProbabilityCalculator {
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
  
  // Computes the probability that diceA wins against diceB (win = face value greater than opponent’s).
  static winProbability(diceA, diceB) {
    const facesA = diceA.faces;
    const facesB = diceB.faces;
    const nA = facesA.length;
    const nB = facesB.length;
    let wins = 0;
    for (let a of facesA) {
      for (let b of facesB) {
        if (a > b) wins++;
      }
    }
    return wins / (nA * nB);
  }
}

/**
 * TableRenderer: renders the probability table using cli-table3.
 */
class TableRenderer {
  static render(probMatrix, diceArray) {
    const headers = ['User dice v'];
    for (let dice of diceArray) {
      headers.push(dice.toString());
    }
    const table = new Table({ head: headers });
    
    for (let i = 0; i < diceArray.length; i++) {
      const row = [diceArray[i].toString()];
      for (let j = 0; j < diceArray.length; j++) {
        row.push(probMatrix[i][j]);
      }
      table.push(row);
    }
    console.log("Probability of the win for the user:");
    console.log(table.toString());
  }
}

/**
 * Game: implements the game logic including:
 * - Determining who goes first (using a fair random protocol).
 * - Letting players select different dice.
 * - Performing dice throws (each throw is determined using a combination
 *   of computer's secure random and user's input).
 * - Determining and displaying the winner.
 */
class Game {
  constructor(diceArray) {
    this.diceArray = diceArray;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  
  ask(question) {
    return new Promise(resolve => {
      this.rl.question(question, answer => {
        resolve(answer.trim());
      });
    });
  }
  
  async run() {
    try {
      // STEP 1: Determine who makes the first move.
      console.log("Let's determine who makes the first move.");
      let fair = FairRandom.generate(2);
      console.log(`I selected a random value in the range 0..1 (HMAC=${fair.hmac}).`);
      let userInput = await this.ask("Try to guess my selection.\n0 - 0\n1 - 1\nX - exit\n? - help\nYour selection: ");
      if (userInput.toUpperCase() === 'X') {
        console.log("Exiting game.");
        this.rl.close();
        process.exit(0);
      }
      if (userInput === '?') {
        this.showHelpTable();
        userInput = await this.ask("Your selection: ");
      }
      const userChoice = parseInt(userInput, 10);
      if (isNaN(userChoice) || (userChoice !== 0 && userChoice !== 1)) {
        console.log("Invalid selection. Exiting.");
        this.rl.close();
        process.exit(1);
      }
      console.log(`My selection: ${fair.number} (KEY=${fair.key}).`);
      const computerStarts = (fair.number !== userChoice);
      
      // STEP 2: Dice selection.
      let userDice, computerDice;
      if (computerStarts) {
        // Computer selects first dice randomly.
        const compIndex = FairRandom.secureRandomInt(this.diceArray.length);
        computerDice = this.diceArray[compIndex];
        console.log(`I make the first move and choose the ${computerDice.toString()} dice.`);
        // Remove selected dice from the available list for the user.
        const remaining = this.diceArray.filter((_, idx) => idx !== compIndex);
        console.log("Choose your dice:");
        remaining.forEach((dice, idx) => {
          console.log(`${idx} - ${dice.toString()}`);
        });
        console.log("X - exit\n? - help");
        let userDiceInput = await this.ask("Your selection: ");
        if (userDiceInput.toUpperCase() === 'X') {
          console.log("Exiting game.");
          this.rl.close();
          process.exit(0);
        }
        if (userDiceInput === '?') {
          this.showHelpTable();
          userDiceInput = await this.ask("Your selection: ");
        }
        const selectedIndex = parseInt(userDiceInput, 10);
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= remaining.length) {
          console.log("Invalid selection. Exiting.");
          this.rl.close();
          process.exit(1);
        }
        userDice = remaining[selectedIndex];
      } else {
        // User selects first dice.
        console.log("You make the first move. Choose your dice:");
        this.diceArray.forEach((dice, idx) => {
          console.log(`${idx} - ${dice.toString()}`);
        });
        console.log("X - exit\n? - help");
        let userDiceInput = await this.ask("Your selection: ");
        if (userDiceInput.toUpperCase() === 'X') {
          console.log("Exiting game.");
          this.rl.close();
          process.exit(0);
        }
        if (userDiceInput === '?') {
          this.showHelpTable();
          userDiceInput = await this.ask("Your selection: ");
        }
        const selectedIndex = parseInt(userDiceInput, 10);
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= this.diceArray.length) {
          console.log("Invalid selection. Exiting.");
          this.rl.close();
          process.exit(1);
        }
        userDice = this.diceArray[selectedIndex];
        // Computer picks from the remaining dice.
        const remaining = this.diceArray.filter((_, idx) => idx !== selectedIndex);
        const compIndex = FairRandom.secureRandomInt(remaining.length);
        computerDice = remaining[compIndex];
        console.log(`I choose the ${computerDice.toString()} dice.`);
      }
      
      // STEP 3: Throw phase.
      // Computer's throw.
      console.log("It's time for my throw.");
      const compThrow = await this.performThrow(computerDice);
      console.log(`My throw is ${compThrow}.`);
      
      // User's throw.
      console.log("It's time for your throw.");
      const userThrow = await this.performThrow(userDice);
      console.log(`Your throw is ${userThrow}.`);
      
      // STEP 4: Determine and display the winner.
      if (userThrow > compThrow) {
        console.log(`You win (${userThrow} > ${compThrow})!`);
      } else if (userThrow < compThrow) {
        console.log(`I win (${compThrow} > ${userThrow})!`);
      } else {
        console.log(`It's a tie (${userThrow} = ${compThrow}).`);
      }
      
      this.rl.close();
    } catch (error) {
      console.error(error.message);
      this.rl.close();
      process.exit(1);
    }
  }
  
  // performThrow: uses the fair random protocol for a dice throw.
  async performThrow(dice) {
    const sides = dice.faces.length;
    const fair = FairRandom.generate(sides);
    console.log(`I selected a random value in the range 0..${sides - 1} (HMAC=${fair.hmac}).`);
    console.log("Add your number modulo " + sides + ".");
    for (let i = 0; i < sides; i++) {
      console.log(`${i} - ${i}`);
    }
    console.log("X - exit\n? - help");
    let userInput = await this.ask("Your selection: ");
    if (userInput.toUpperCase() === 'X') {
      console.log("Exiting game.");
      process.exit(0);
    }
    if (userInput === '?') {
      this.showHelpTable();
      userInput = await this.ask("Your selection: ");
    }
    const userNumber = parseInt(userInput, 10);
    if (isNaN(userNumber) || userNumber < 0 || userNumber >= sides) {
      console.log("Invalid selection. Exiting.");
      process.exit(1);
    }
    console.log(`My number is ${fair.number} (KEY=${fair.key}).`);
    const index = (fair.number + userNumber) % sides;
    console.log(`The result is ${fair.number} + ${userNumber} = ${index} (mod ${sides}).`);
    return dice.roll(index);
  }
  
  // showHelpTable: displays the win probability table.
  showHelpTable() {
    const matrix = ProbabilityCalculator.computeMatrix(this.diceArray);
    TableRenderer.render(matrix, this.diceArray);
  }
}

// Main entry point.
async function main() {
  try {
    const args = process.argv.slice(2);
    const diceArray = DiceParser.parse(args);
    const game = new Game(diceArray);
    await game.run();
  } catch (error) {
    console.error("Error: " + error.message);
    console.error("Usage: node game.js <dice1> <dice2> <dice3> ...");
    console.error("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
    process.exit(1);
  }
}

main();
