```markdown
# Non-Transitive Dice Game 🎲

A console implementation of a generalized non-transitive dice game with provably fair random generation and configurable dice configurations.

## Features ✨
- Fair random number generation using HMAC-SHA3-256
- Support for arbitrary dice configurations (3+ dice)
- Probability calculation matrix for all dice pairs
- Interactive CLI menu system
- Cryptographic proof of fairness
- Error handling with user-friendly messages
- ASCII probability tables using `cli-table3`

## Installation ⚙️

1. Ensure **Node.js v14+** is installed (SHA3 support required)
2. Clone the repository:
```bash
git clone https://github.com/Sohelrana2815/non-transitive-dice-game
cd dice-game
```
3. Install dependencies:
```bash
npm install
```

## Usage 🕹️

Run the game with 3 or more dice configurations:
```bash
node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3
```

**Game Flow:**
1. Fair first move determination
2. Interactive dice selection
3. Provably fair dice rolls
4. Win/lose comparison
5. Help table with probabilities

## Example Commands 📝

Valid input:
```bash
node game.js 1,2,3,4,5,6 6,5,4,3,2,1 9,9,3,3,5,5
```

Invalid input (shows errors):
```bash
node game.js 1,2 three,4 5,6,7,8 # Non-integer values
node game.js 1,2,3,4,5,6        # Only 1 die
```

## Demo Video 🎥

[![Game Demo](https://img.youtube.com/vi/JI8rqfTZ7Rk/0.jpg)](https://www.youtube.com/watch?v=JI8rqfTZ7Rk)

## Dependencies 📦

```json
"dependencies": {
  "chalk": "^4.1.2",
  "cli-table3": "^0.6.2",
  "readline-sync": "^1.4.10"
}
```
