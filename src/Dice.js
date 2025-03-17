class Dice {
  constructor(faces) {
    this.faces = faces;
  }

  roll(index) {
    return this.faces[index];
  }
  toString() {
    return `[${this.faces.join(", ")}]`;
  }
}

module.exports = Dice;
