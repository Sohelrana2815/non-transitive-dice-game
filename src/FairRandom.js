const crypto = require('crypto');

class FairRandom {
  static secureRandomInt(range) {
    const max = Math.floor(256 / range) * range;
    let randomNumber;
    do {
      const buf = crypto.randomBytes(1);
      randomNumber = buf.readUInt8(0);
    } while (randomNumber >= max);
    return randomNumber % range;
  }

  static generate(range) {
    const keyBuffer = crypto.randomBytes(32);
    const number = FairRandom.secureRandomInt(range);
    const hmac = crypto.createHmac('sha3-256', keyBuffer)
                       .update(number.toString())
                       .digest('hex')
                       .toUpperCase();
    return { number, key: keyBuffer.toString('hex').toUpperCase(), hmac };
  }
}

module.exports = FairRandom;