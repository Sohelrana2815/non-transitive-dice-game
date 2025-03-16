const crypto = require("crypto");

class FairRandomGenerator {
  generate(max) {
    const key = crypto.randomBytes(32);
    // Range of random number (0..1)
    const number = crypto.randomInt(0, max, 1);
    const hmac = crypto
      .createHmac("sha3-256", key)
      .update(number.toString())
      .digest("hex");
    return { number, key: key.toString("hex"), hmac };
  }
}

module.exports = FairRandomGenerator;
