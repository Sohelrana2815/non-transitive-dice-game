const crypto = require("crypto");
const chalk = require("chalk");

class Verification {
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
