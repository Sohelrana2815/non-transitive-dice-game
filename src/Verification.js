const crypto = require("crypto");
const chalk = require("chalk");

class Verification {
  static renderHelpText(diceArray) {
    console.log(
      chalk.green(`
    === Verification Instructions ===
    1. After game ends, you'll see a verification menu
    2. Select which HMAC to verify
    3. Enter the disclosed key and number
    4. System will confirm if HMAC matches
    
    The protocol ensures:
    - Computer commits to numbers first (via HMAC)
    - You contribute randomness (your number selection)
    - Final result combines both values
      `)
    );

    this.renderProbabilityTable(diceArray);
  }

  constructor() {
    this.records = [];
  }

  addRecord(context, key, number, hmac) {
    this.records.push({ context, key, number, hmac });
  }

  verify(context, userKey, userNumber) {
    const record = this.records.find((r) => r.context === context);
    if (!record) return chalk.red("No record found for this context");

    try {
      const keyBuffer = Buffer.from(userKey, "hex");
      const calculatedHMAC = crypto
        .createHmac("sha3-256", keyBuffer)
        .update(userNumber.toString())
        .digest("hex")
        .toUpperCase();

      return calculatedHMAC === record.hmac
        ? chalk.green("✓ HMAC verification SUCCESSFUL")
        : chalk.red("✗ HMAC verification FAILED");
    } catch (e) {
      return chalk.red("Invalid key format");
    }
  }

  getVerificationOptions() {
    return this.records.map((r, i) => `${i + 1} - Verify ${r.context}`);
  }
}

module.exports = Verification;
