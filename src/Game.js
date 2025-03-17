const readline = require('readline');
const chalk = require('chalk');
const FairRandom = require('./FairRandom');
const TableRenderer = require('./TableRenderer');
const Verification = require('./Verification');

class Game {
  constructor(diceArray) {
    this.diceArray = diceArray;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.verification = new Verification();
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
      console.log(chalk.yellow("\n=== Non-Transitive Dice Game ==="));
      
      // First move determination
      const fairFirst = FairRandom.generate(2);
      this.verification.addRecord(
        "first-move-selection",
        fairFirst.key,
        fairFirst.number,
        fairFirst.hmac
      );
      
      console.log(chalk.yellow("\n=== First Move Determination ==="));
      console.log(`I selected a random value in the range 0..1`);
      console.log(`HMAC: ${fairFirst.hmac}`);
      
      let userInput = await this.ask(
        "Try to guess my selection:\n" +
        "0 - 0\n1 - 1\nX - exit\n? - help\n" +
        "Your selection (0 or 1): "
      );
      
      if (userInput.toUpperCase() === 'X') process.exit(0);
      if (userInput === '?') {
        TableRenderer.renderHelpText(this.diceArray);
        userInput = await this.ask("Your selection (0 or 1): ");
      }

      const userChoice = parseInt(userInput, 10);
      if (isNaN(userChoice) || (userChoice !== 0 && userChoice !== 1)) {
        throw new Error("Invalid selection");
      }

      console.log(`\nMy selection: ${fairFirst.number}`);
      console.log(`KEY: ${fairFirst.key}`);
      
      const computerStarts = fairFirst.number !== userChoice;
      let userDice, computerDice;

      // Dice selection
      if (computerStarts) {
        console.log(chalk.cyan("\nI make the first move"));
        computerDice = this.selectComputerDice();
        console.log(`I choose the ${computerDice.toString()} dice.`);
        userDice = await this.selectUserDice(computerDice);
      } else {
        console.log(chalk.cyan("\nYou make the first move"));
        userDice = await this.selectUserDice();
        console.log(`You choose the ${userDice.toString()} dice.`);
        computerDice = this.selectComputerDice(userDice);
        console.log(`I choose the ${computerDice.toString()} dice.`);
      }

      // Throws
      console.log(chalk.yellow("\n=== Throws ==="));
      const compThrow = await this.performThrow(computerDice, "computer-throw");
      const userThrow = await this.performThrow(userDice, "user-throw");

      // Results
      console.log(chalk.yellow("\n=== Final Results ==="));
      console.log(`My throw: ${compThrow}`);
      console.log(`Your throw: ${userThrow}`);
      console.log(
        userThrow > compThrow ? chalk.green("You win!") :
        userThrow < compThrow ? chalk.red("I win!") : 
        chalk.yellow("It's a tie!")
      );

      // Verification
      await this.handleVerification();

    } catch (error) {
      console.log(chalk.red(error.message));
      this.rl.close();
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async selectUserDice(excludedDice = null) {
    const available = this.diceArray.filter(d => d !== excludedDice);
    
    console.log("\nAvailable dice:");
    available.forEach((d, i) => console.log(`${i} - ${d.toString()}`));
    
    while(true) {
      const input = await this.ask(
        "\nChoose your dice:\n" +
        "X - exit\n? - help\n" +
        "Your selection (0-1): "
      );
      
      if (input.toUpperCase() === 'X') process.exit(0);
      if (input === '?') {
        TableRenderer.renderHelpText(this.diceArray);
        continue;
      }
      
      const index = parseInt(input);
      if (!isNaN(index) && index >= 0 && index < available.length) {
        return available[index];
      }
      console.log(chalk.red("Invalid selection"));
    }
  }

  selectComputerDice(excludedDice = null) {
    const available = this.diceArray.filter(d => d !== excludedDice);
    const index = FairRandom.secureRandomInt(available.length);
    return available[index];
  }

  async performThrow(dice, context) {
    const sides = dice.faces.length;
    const fair = FairRandom.generate(sides);
    this.verification.addRecord(context, fair.key, fair.number, fair.hmac);

    console.log(chalk.yellow(`\n=== ${context.toUpperCase()} ===`));
    console.log(`I selected a random value in 0..${sides-1}`);
    console.log(`HMAC: ${fair.hmac}`);
    
    console.log("\nAdd your number modulo " + sides + ":");
    for (let i = 0; i < sides; i++) {
      console.log(`${i} - ${i}`);
    }
    console.log("X - exit\n? - help");

    const userNumber = await this.getValidNumber(sides);
    const index = (fair.number + userNumber) % sides;
    
    console.log(`\nMy number: ${fair.number}`);
    console.log(`KEY: ${fair.key}`);
    console.log(`Result: (${fair.number} + ${userNumber}) % ${sides} = ${index}`);
    
    return dice.roll(index);
  }

  async getValidNumber(max) {
    while(true) {
      const input = await this.ask(
        "Your selection (0-" + (max-1) + "): "
      );
      
      if (input.toUpperCase() === 'X') process.exit(0);
      if (input === '?') {
        TableRenderer.renderHelpText(this.diceArray);
        continue;
      }
      
      const num = parseInt(input);
      if (!isNaN(num) && num >= 0 && num < max) return num;
      console.log(chalk.red("Invalid number"));
    }
  }

  async handleVerification() {
    console.log(chalk.yellow("\n=== Fairness Verification ==="));
    console.log("You can verify any HMAC now:");
    this.verification.getVerificationOptions().forEach(opt => console.log(opt));
    
    while(true) {
      const input = await this.ask(
        "\nEnter number to verify or X to exit:\n" +
        "Your choice: "
      );
      
      if (input.toUpperCase() === 'X') break;
      
      const index = parseInt(input) - 1;
      if (isNaN(index) || index < 0 || index >= this.verification.records.length) {
        console.log(chalk.red("Invalid selection"));
        continue;
      }
      
      const record = this.verification.records[index];
      console.log(chalk.yellow(`\nVerifying ${record.context}:`));
      console.log(`Original HMAC: ${record.hmac}`);
      
      const userKey = await this.ask("Enter the disclosed key: ");
      const userNumber = await this.ask("Enter the disclosed number: ");
      
      const result = this.verification.verify(
        record.context,
        userKey,
        parseInt(userNumber)
      );
      
      console.log(result);
    }
  }
}

module.exports = Game;