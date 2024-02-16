const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function generateSecureRandomKey(){
    return crypto.randomBytes(32);
}

function selectComputerMove(moves) {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
}

function calculateHMAC(key, data){
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    return hmac.digest('hex');
}

function movesValidation(moves){
    if(moves.length < 3){
        throw  new Error("Error: The number of moves is less than three");
    }
    
    if(moves.length % 2 == 0){
        throw  new Error("Error: The number of steps must be odd");
    } 

    const uniqueMoves = new Set(moves);
    if (uniqueMoves.size !== moves.length) {
        throw new Error("Error: There should be no repetitive moves")
    }

    return moves;
}

function displayMenu(moves) {
    console.log('Available moves:');
    moves.forEach((move, index) => {
        console.log(`${index + 1} - ${move}`);
    });
    console.log('0 - exit');
    console.log('? - help');
}

function displayHelp(moves) {
    // Creating a top row for the table with move names
    let topRow = 'Move  | ';
    moves.forEach(move => {
        topRow += `${move.substring(0, 3)} | `;
    });
    console.log(topRow);

    // Creating a divider
    let divider = '-'.repeat(topRow.length);
    console.log(divider);

    // Generating the table body
    moves.forEach((move, index) => {
        let row = `${move.substring(0, 3)} | `;
        for (let j = 0; j < moves.length; j++) {
            if (index === j) {
                row += 'Draw | ';
            } else {
                const half = Math.floor(moves.length / 2);
                const distance = (j - index + moves.length) % moves.length;

                if (distance <= half) {
                    row += 'Win  | ';
                } else {
                    row += 'Lose | ';
                }
            }
        }
        console.log(row);
    });
}

function processUserInput(moves, computerMove, key) {
    rl.question('Enter your move: ', (userInput) => {
        if (userInput === '0') {
            console.log('Game exited.');
            rl.close();
            return; 
        }
    
        if (userInput === '?') {
            displayHelp(moves);
            return processUserInput(moves, computerMove);
        }
    
        const moveIndex = parseInt(userInput) - 1;
        if (moveIndex >= 0 && moveIndex < moves.length) {
            const userMove = moves[moveIndex];
            console.log(`Your move: ${userMove}`);
    
            const outcome = determineOutcome(userMove, computerMove, moves);
            console.log(`Computer move: ${computerMove}`);
            console.log(outcome);
            console.log(`HMAC key: ${key.toString('hex')}`);
            rl.close();
        } else {
            console.log('Invalid input. Please try again.');
            return processUserInput(moves, computerMove);
        }
    });  
}


function determineOutcome(userInput, computerMove, moves){
    const userIndex = moves.indexOf(userInput);
    const computerIndex = moves.indexOf(computerMove);
    const half = Math.floor(moves.length / 2);

    let steps = (computerIndex - userIndex + moves.length) % moves.length;

    if (steps === 0) {
        return 'Draw';
    } else if (steps <= half) {
        return 'You lose';
    } else {
        return 'You win!';
    }
}

let moves;

try{
    moves = movesValidation(process.argv.slice(2));
    const key = generateSecureRandomKey();
    const computerMove = selectComputerMove(moves);
    const hmac = calculateHMAC(key, computerMove);

    console.log(`HMAC: ${hmac}`);
    displayMenu(moves);
    processUserInput(moves, computerMove, key);
} catch(error){
    console.error(error.message);
    rl.close();
}

