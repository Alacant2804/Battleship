const modulo = document.querySelector('.modulo');
const startButton = document.querySelector('.startButton');

let playerTurn = true;
let currentShip = null;
let placedShips = [];
let currentOrientation = 'horizontal';
const boardSize = 10;

let aiState = {
    lastHits: [],
    targetingMode: false,
    direction: null,
    possibleTargets: []
};

class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.hits = 0;
        this.placed = false;
        this.orientation = null;
        this.startIndex = null;
    }

    hit() {
        this.hits++;
        if (this.hits === this.length) {
            return true;
        }
        return false;
    }
}

const userShips = [
    new Ship('destroyer', 2),
    new Ship('submarine', 3),
    new Ship('cruiser', 3),
    new Ship('battleship', 4),
    new Ship('carrier', 5)
];

const computerShips = [
    new Ship('destroyer', 2),
    new Ship('submarine', 3),
    new Ship('cruiser', 3),
    new Ship('battleship', 4),
    new Ship('carrier', 5)
];

function createBoard(containerId, size) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);

        if (containerId === 'moduloGameboard') {
            cell.addEventListener('mouseover', (e) => showShipPreview(e, currentShip, currentOrientation));
            cell.addEventListener('mouseout', (e) => clearShipPreview(e, currentShip, currentOrientation));
        }

        container.appendChild(cell);
    }

    return container;
}

function showShipPreview(e, ship, orientation) {
    if (!ship) return;

    const index = parseInt(e.target.getAttribute('data-index'), 10);
    const moduloGameboard = document.getElementById('moduloGameboard').children;

    for (let i = 0; i < ship.length; i++) {
        let cellIndex = orientation === 'horizontal' ? index + i : index + i * boardSize;
        if (cellIndex >= moduloGameboard.length || (orientation === 'horizontal' && Math.floor(cellIndex / boardSize) !== Math.floor(index / boardSize))) {
            continue;
        }

        if (canPlaceShip(index, ship.length, orientation, moduloGameboard, boardSize)) {
            moduloGameboard[cellIndex].classList.add('preview');
        } else {
            moduloGameboard[cellIndex].classList.add('invalid');
        }
    }
}

function clearShipPreview(e, ship, orientation) {
    const moduloGameboard = document.getElementById('moduloGameboard').children;

    Array.from(moduloGameboard).forEach(cell => {
        cell.classList.remove('preview');
        cell.classList.remove('invalid');
    });
}

function isSurroundingCellEmpty(cellIndex, board, boardSize) {
    const row = Math.floor(cellIndex / boardSize);
    const col = cellIndex % boardSize;

    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            const checkRow = row + dRow;
            const checkCol = col + dCol;

            if (checkRow < 0 || checkRow >= boardSize || checkCol < 0 || checkCol >= boardSize) continue;

            const surroundingCellIndex = checkRow * boardSize + checkCol;

            if (board[surroundingCellIndex].classList.contains('ship') || board[surroundingCellIndex].classList.contains('computerShip')) {
                return false; 
            }
        }
    }
    return true; 
}

function canPlaceShip(startIndex, shipLength, orientation, board, boardSize) {
    for (let i = 0; i < shipLength; i++) {
        let cellIndex = orientation === 'horizontal' ? startIndex + i : startIndex + i * boardSize;
        
        if (orientation === 'horizontal' && Math.floor(cellIndex / boardSize) !== Math.floor(startIndex / boardSize)) {
            return false;
        }

        if (orientation === 'vertical' && cellIndex >= board.length) {
            return false;
        }

        if (!board[cellIndex] || board[cellIndex].classList.contains('ship') || board[cellIndex].classList.contains('computerShip')) {
            return false;
        }

        if (!isSurroundingCellEmpty(cellIndex, board, boardSize)) {
            return false;
        }
    }
    return true;
}

function placeShip(cell, ship, orientation) {
    const index = parseInt(cell.getAttribute('data-index'), 10);
    const moduloGameboard = document.getElementById('moduloGameboard').children;

    if (canPlaceShip(index, ship.length, orientation, moduloGameboard, boardSize)) {
        for (let i = 0; i < ship.length; i++) {
            const offset = orientation === 'horizontal' ? i : i * boardSize;
            moduloGameboard[index + offset].classList.add('ship');
        }
        ship.placed = true;
        ship.orientation = orientation;
        ship.startIndex = index;
        placedShips.push(ship);
        return true;
    } else {
            return false;
    }
}

function undoLastPlacement() {
    if (placedShips.length > 0) {
        const lastShip = placedShips.pop();
        const { startIndex, orientation, length } = lastShip;
        const moduloGameboard = document.getElementById('moduloGameboard').children;

        for (let i = 0; i < length; i++) {
            const offset = orientation === 'horizontal' ? i : i * boardSize;
            moduloGameboard[startIndex + offset].classList.remove('ship');
        }

        lastShip.placed = false;
        lastShip.orientation = null;
        lastShip.startIndex = null;

        currentShip = lastShip;  
    }
}

function placeComputerShips() {
    const computerGameboard = document.getElementById('computerGameboard').children;
    computerShips.forEach((ship, shipIndex) => {
        let placed = false;
        while (!placed) {
            const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const startIndex = Math.floor(Math.random() * computerGameboard.length);
            if (canPlaceShip(startIndex, ship.length, orientation, computerGameboard, boardSize)) {
                for (let i = 0; i < ship.length; i++) {
                    const offset = orientation === 'horizontal' ? i : i * boardSize;
                    const index = startIndex + offset;
                    if (index < computerGameboard.length) {
                        computerGameboard[index].classList.add('computerShip');
                        computerGameboard[index].setAttribute('data-ship-index', shipIndex);
                    }
                }
                ship.placed = true;
                ship.orientation = orientation;
                ship.startIndex = startIndex;
                placed = true;
            }
        }
    });
}

function markSurroundingCellsAsMiss(ship, board) {
    const start = ship.startIndex;
    const length = ship.length;
    const horizontal = ship.orientation === 'horizontal';
    const boardCells = document.getElementById(board).children;

    for (let i = 0; i < length; i++) {
        const index = horizontal ? start + i : start + i * boardSize;
        const row = Math.floor(index / boardSize);
        const col = index % boardSize;

        [-1, 0, 1].forEach(dRow => {
            [-1, 0, 1].forEach(dCol => {
                const newRow = row + dRow;
                const newCol = col + dCol;
                if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                    const newIndex = newRow * boardSize + newCol;
                    if ((!boardCells[newIndex].classList.contains('ship') && !boardCells[newIndex].classList.contains('hit')) || (!boardCells[newIndex].classList.contains('computerShip') && !boardCells[newIndex].classList.contains('hit'))) {
                        boardCells[newIndex].classList.add('miss');
                    }
                }
            });
        });
    }
}

function setupPlayerAttack() {
    const computerCells = document.getElementById('computerGameboard').querySelectorAll('.cell');
    computerCells.forEach(cell => {
        cell.addEventListener('click', function(event) {
            if (!playerTurn || cell.classList.contains('hit') || cell.classList.contains('miss')) {
                return;
            }

            if (cell.classList.contains('computerShip')) {
                const shipIndex = parseInt(cell.getAttribute('data-ship-index'), 10);
                const ship = computerShips[shipIndex];
                if (!ship) {
                    return;
                }
                cell.classList.add('hit');
                if (ship.hit()) {
                    markSurroundingCellsAsMiss(ship, 'computerGameboard');
                }
            } else {
                cell.classList.add('miss');
            }

            const gameEnded = checkForWin();
            if (!gameEnded) {
                playerTurn = false;
                setTimeout(computerAttack, 1000);
            }
        });
    });
}

function getRandomTarget() {
    const userCells = document.getElementById('userGameboard').querySelectorAll('.cell');
    let index;
    let cell;

    do {
        index = Math.floor(Math.random() * userCells.length);
        cell = userCells[index];
    } while (cell.classList.contains('hit') || cell.classList.contains('miss')); 

    return cell;
}

// Check if we are in targeting mode and there are possible targets
// Take first target from that array and pass it to executeAttact function
// Otherwise get random target
function computerAttack() {
    if (!playerTurn) {
        let target;
        if (aiState.targetingMode && aiState.possibleTargets.length > 0) {
            target = aiState.possibleTargets.pop();
        } else {
            aiState.targetingMode = false;
            aiState.possibleTargets = [];
            target = getRandomTarget();
        }

        executeAttack(target);
    }
}

// If computer hit the cell with ship
// Add that cell to lastHits array
// If sunk the ship - mark surrounding cells as missed and reset the lastHits array
// And exit targeting mode  
// Otherwise pass the cell to the updatePossibleTargets
// If there was no ship, add miss and reevalute target
function executeAttack(cell) {
    if (cell.classList.contains('ship')) {
        const shipIndex = parseInt(cell.getAttribute('data-ship-index'), 10);
        const ship = userShips[shipIndex];
        aiState.lastHits.push(cell); 

        if (ship.hit()) {
            cell.classList.add('hit');
            markSurroundingCellsAsMiss(ship, 'userGameboard');
            aiState.lastHits = [];
            aiState.possibleTargets = [];
            aiState.direction = false;
            aiState.targetingMode = false;
        } else {
            aiState.targetingMode = true;
            updatePossibleTargets(cell); // Relevant part of the attack when hit
        }

        cell.classList.add('hit');
        
    } else {
        cell.classList.add('miss');
        reevaluateTargets(cell);
    }

    checkComputerWin();
    playerTurn = true; 
}

// If there are at least 2 cells in lastHits array
// Use the function that determines the orientation of the ship
// Otherwise try to figure out the possible orientation
function updatePossibleTargets(hitCell) {
    if (aiState.lastHits.length > 1) {
        // Use the known hits to determine the direction and target accordingly.
        determineDirectionAndAddTargets(hitCell);
    } else {
        // Add targets based on the available information (directional or all adjacent).
        addTargetCells(hitCell);
    }
}

// Based on the difference between cell's indexes checks the placement of the ship
// Based on orientation adds to the potential target array potential targets
function determineDirectionAndAddTargets(hitCell) {
    const lastIndex = parseInt(aiState.lastHits[aiState.lastHits.length - 2].getAttribute('data-index'), 10);
    const currentIndex = parseInt(hitCell.getAttribute('data-index'), 10);
    const diff = currentIndex - lastIndex;

    if (Math.abs(diff) === 1 || Math.abs(diff) === boardSize) {
            aiState.direction = Math.abs(diff) === 1 ? 'horizontal' : 'vertical';
            addIfValid(currentIndex + diff, currentIndex);
            addIfValid(currentIndex - diff, currentIndex);
    } else {
        const offset = aiState.direction === 'horizontal' ? 1 : boardSize;
        addIfValid(currentIndex + offset, currentIndex)
    }
}

// Selects the cell and based on that cell we add to possible target array the cell + offset to check the nearby cells
// This function is used to basically find the orientation of the ship
function addTargetCells(hitCell) {
    const index = parseInt(hitCell.getAttribute('data-index'), 10);
    if (aiState.lastHits.length === 1 && aiState.direction) { // Probably not needed
        const offset = (aiState.direction === 'horizontal') ? 1 : boardSize;
        addIfValid(index + offset, index);
        addIfValid(index - offset, index);
    } else {
        [1, boardSize, -1, -boardSize].forEach(offset => {
            addIfValid(index + offset, index);
        });
    }
}

//Checks if the cell is inside the board. If yes adds it to the possible targets array
function addIfValid(index, baseIndex) {
    const boardCells = document.getElementById('userGameboard').children;
    
    if (index >= 0 && index < boardCells.length) {
        const baseRow = Math.floor(baseIndex / boardSize);
        const baseCol = baseIndex % boardSize;
        const newRow = Math.floor(index / boardSize);
        const newCol = index % boardSize;

        // Check for column wrapping only if the direction is known
        if (aiState.direction) {
            if ((aiState.direction === 'horizontal' && baseRow !== newRow) ||
                (aiState.direction === 'vertical' && baseCol !== newCol)) {
                return;
            }
        } else {
            // Prevent horizontal wrapping at edges when no direction is established
            if ((baseCol === 0 && newCol === boardSize - 1) || (baseCol === boardSize - 1 && newCol === 0)) {
                return;
            }
            // Prevent vertical wrapping at top and bottom when no direction is established
            if ((baseRow === 0 && newRow === boardSize - 1) || (baseRow === boardSize - 1 && newRow === 0)) {
                return;
            }
        }


        const cell = boardCells[index];
        if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
            aiState.possibleTargets.push(cell);
        }
    }
}

function reevaluateTargets(missedCell) {
    aiState.possibleTargets = aiState.possibleTargets.filter(target => target !== missedCell);

    if (aiState.possibleTargets.length === 0 && aiState.lastHits.length > 0) {
        extendAttackLine(aiState.lastHits[aiState.lastHits.length - 1]);
    }

    if (aiState.possibleTargets.length === 0) {
        aiState.targetingMode = false; 
    }
}

 function extendAttackLine() {
    if (aiState.lastHits.length >= 1) {
        const currentIndex = parseInt(aiState.lastHits[aiState.lastHits.length - 1].getAttribute('data-index'), 10);

        if (aiState.lastHits.length === 1) {
            // Explore all possible directions because orientation is not yet established.
            [1, -1, boardSize, -boardSize].forEach(offset => {
                addIfValid(currentIndex + offset, currentIndex);
            });
        } else {
            // Direction is known, proceed in both directions of the established line.
            const lastIndex = parseInt(aiState.lastHits[aiState.lastHits.length - 2].getAttribute('data-index'), 10);
            const diff = currentIndex - lastIndex;

            // Check in the direction of the last hit and the opposite direction
            addIfValid(currentIndex + diff, currentIndex);
            addIfValid(currentIndex - diff, currentIndex);
        }
    }
}

function checkForWin() {
    const hits = document.querySelectorAll('#computerGameboard .computerShip.hit').length;
    const totalShips = document.querySelectorAll('#computerGameboard .computerShip').length;
    if (hits === totalShips) {
        showModal("Congratulations! You win!");
        return true;
    }
    return false; 
}

function checkComputerWin() {
    const hits = document.querySelectorAll('#userGameboard .ship.hit').length;
    const totalShips = document.querySelectorAll('#userGameboard .ship').length;
    if (hits === totalShips) {
        showModal("Sorry! Computer wins!");
    }
}

function handleCellClick(event) {
    const cell = event.target;
    if (currentShip) {
        const success = placeShip(cell, currentShip, currentOrientation);
        if (success) {
            // Find the current index of the ship in the userShips array
            let currentIndex = userShips.indexOf(currentShip);
            // Move to the next ship in the userShips array or set to null if all ships are placed
            currentShip = currentIndex + 1 < userShips.length ? userShips[currentIndex + 1] : null;
            if (!currentShip) {
                console.log('All ships placed');
                const allPlaced = userShips.every(ship => ship.placed);
                startButton.disabled = !allPlaced;
            }
        }
    }
}

function transferShipsToMainBoard() {
    const userGameboard = document.getElementById('userGameboard').children;
    userShips.forEach((ship, shipIndex) => {
        if (ship.placed) {
            for (let i = 0; i < ship.length; i++) {
                const offset = ship.orientation === 'horizontal' ? i : i * boardSize;
                const cellIndex = ship.startIndex + offset;
                if (userGameboard[cellIndex]) {
                    userGameboard[cellIndex].classList.add('ship');
                    userGameboard[cellIndex].setAttribute('data-ship-index', shipIndex);
                }
            }
        }
    });
}

function showModal(winMessage) {
    let modal = document.getElementById('winModal');
    let span = document.getElementsByClassName("close")[0];
    let message = document.getElementById('winMessage');

    message.textContent = winMessage; 
    modal.style.display = "block";

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function restartGame() {
    playerTurn = true; 
    aiState.lastHits = [];
    aiState.targetingMode = false;
    aiState.possibleTargets = [];

    const userCells = document.querySelectorAll('#userGameboard .cell');
    const computerCells = document.querySelectorAll('#computerGameboard .cell');
    userCells.forEach(cell => cell.className = 'cell');
    computerCells.forEach(cell => cell.className = 'cell');

    userShips.forEach(ship => {
        ship.placed = false;
        ship.hits = 0;
    });

    computerShips.forEach(ship => {
        ship.placed = false;
        ship.hits = 0;
    });

    document.getElementById('winModal').style.display = 'none';
    document.querySelector('.modulo').style.display = 'flex';

    initiateGame()
}

function initiateGame() {
    const userGameboard = createBoard('userGameboard', 10); 
    const computerGameboard = createBoard('computerGameboard', 10);
    const moduloGameboard = createBoard('moduloGameboard', 10);
    placeComputerShips();

    currentShip = userShips[0]; 

    const cells = moduloGameboard.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    setupControlListeners()
}

function setupControlListeners() {
    const toggleButton = document.getElementById('toggleButton');
    const placementDisplay = document.querySelector('.placementDisplay');
    const undoButton = document.getElementById('undoButton');
    const restartButton = document.getElementById('restartButton')

    restartButton.addEventListener('click', restartGame)

    placementDisplay.textContent = 'Horizontal';
    currentOrientation = 'horizontal';

    toggleButton.onclick = togglePlacement;
    startButton.onclick = startGame;

    undoButton.addEventListener('click', undoLastPlacement);

    function togglePlacement() {
        placementDisplay.textContent = placementDisplay.textContent === 'Horizontal' ? 'Vertical' : 'Horizontal';
        currentOrientation = placementDisplay.textContent.toLowerCase();
    }

    function startGame() {
        if (userShips.every(ship => ship.placed)) {
            transferShipsToMainBoard();
            document.querySelector('.modulo').style.display = 'none';
            setupPlayerAttack();
        } else {
            alert("You must place all ships before starting the game.");
        }
    } 
}

document.addEventListener('DOMContentLoaded', function() {
    initiateGame();
});
